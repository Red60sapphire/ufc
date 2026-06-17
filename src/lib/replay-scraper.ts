import { rawQueryOrThrow, query } from './db';

const BASE = 'https://mmareplayfull.com';
const API_BASE = 'https://api.mmareplayfull.com';

interface MEvent {
  id: string; name: string; date: string; location: string; cover_url: string;
}

interface FightData {
  id: string; weight_class: string; method: string; round: number; fight_time: string;
  clip: { playlist_url: string } | null; is_clip_available: boolean;
  participants: { display_name: string; result: string; fighter: { thumbnail_url: string | null; vertical_image_url: string | null } }[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function extractNextData(html: string): any {
  const m = html.match(/__NEXT_DATA__.*?application\/json">(.*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

async function fetchEvents(limit = 20): Promise<MEvent[]> {
  const html = await fetchPage(BASE);
  const data = extractNextData(html);
  const all: any[] = data?.props?.pageProps?.latestEvents || [];
  const avail = all.filter((e: any) => e.is_video_available);
  console.log('[SCRAPER] Homepage:', all.length, 'total,', avail.length, 'with video, limit', limit);
  return avail.reverse().slice(0, limit).map((e: any) => ({
    id: e.id, name: e.name, date: e.date, location: e.location || '',
    cover_url: e.cover_url ? `${API_BASE}${e.cover_url}` : '',
  }));
}

function buildEventSlug(event: MEvent): string {
  return `${event.date}-${slugify(event.name)}-${event.id}`;
}

function formatDate(d: any): string {
  if (typeof d === 'string') return d.substring(0, 10);
  try { return new Date(d).toISOString().substring(0, 10); } catch { return ''; }
}

// Process an array of items in parallel batches
async function batchMap<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  const q = [...items];
  while (q.length > 0) {
    const batch = q.splice(0, batchSize);
    const r = await Promise.all(batch.map(fn));
    results.push(...r);
  }
  return results;
}

export async function scrapeAll(eventLimit = 20): Promise<{
  events: number; fights: number; newFights: number; errors: string[];
}> {
  const errors: string[] = [];
  let totalEvents = 0; let totalFights = 0; let newFights = 0;

  try {
    const start = Date.now();

    // Get events from homepage
    const events = await fetchEvents(eventLimit);
    totalEvents = events.length;
    console.log('[SCRAPER] Fetched', totalEvents, 'events in', Date.now() - start, 'ms');

    // Get existing events from DB
    const existingRows: any[] = await query`SELECT DISTINCT event_name, event_date FROM ufc_replays`;
    const existingEvents = new Set(
      existingRows.map((r: any) => `${r.event_name}|${formatDate(r.event_date)}`)
    );
    const newEvents = events.filter(e => !existingEvents.has(`${e.name}|${e.date.substring(0, 10)}`));
    console.log('[SCRAPER] New events:', newEvents.length, '(skipped', events.length - newEvents.length, 'existing)');

    if (newEvents.length === 0) {
      console.log('[SCRAPER] No new events to scrape');
      return { events: totalEvents, fights: totalFights, newFights, errors };
    }

    // Fetch all event pages in parallel (batches of 5)
    const eventPages: { event: MEvent; fights: FightData[] }[] = [];
    await batchMap(newEvents, 5, async (event) => {
      try {
        const slug = buildEventSlug(event);
        const html = await fetchPage(`${BASE}/events/${slug}`);
        const data = extractNextData(html);
        const fights: FightData[] = data?.props?.pageProps?.fights || [];
        eventPages.push({ event, fights });
        const valid = fights.filter(f => f.clip && f.is_clip_available && f.participants?.length >= 2);
        console.log('[SCRAPER]', event.name, ':', valid.length, '/', fights.length, 'with clips');
      } catch (err: any) {
        errors.push(`${event.name}: ${err.message}`);
      }
    });

    console.log('[SCRAPER] All event pages fetched in', Date.now() - start, 'ms,', eventPages.length, 'events with fights');

    // Process all fights across all events in parallel (batches of 10 fights)
    const allFightTasks: { event: MEvent; fight: FightData }[] = [];
    for (const { event, fights } of eventPages) {
      for (const fight of fights) {
        if (fight.clip && fight.is_clip_available && fight.participants?.length >= 2) {
          allFightTasks.push({ event, fight });
        }
      }
    }
    console.log('[SCRAPER] Total valid fights to process:', allFightTasks.length);

    await batchMap(allFightTasks, 10, async ({ event, fight }) => {
      const p1 = fight.participants[0];
      const p2 = fight.participants[1];
      const title = `${p1.display_name} vs ${p2.display_name}`;
      const slug = `${event.date}-${slugify(p1.display_name)}-vs-${slugify(p2.display_name)}-${fight.id}`;

      // Check slug dedup
      const existing = await query`SELECT id FROM ufc_replays WHERE slug = ${slug}`;
      if (existing.length > 0) return;

      const clipUrl = `${API_BASE}${fight.clip!.playlist_url}`;

      // Validate clip
      const verify = await fetch(clipUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://mmareplayfull.com/',
        },
      });
      if (!verify.ok) {
        errors.push(`${title}: clip HTTP ${verify.status}`);
        return;
      }

      const promotion = event.name.includes('UFC') ? 'UFC' :
        event.name.includes('PFL') ? 'PFL' :
        event.name.includes('ONE') ? 'ONE Championship' :
        event.name.includes('Bellator') ? 'Bellator' : 'UFC';

      const result = fight.method && fight.round ? `${fight.method} Round ${fight.round}` : null;
      const desc = `${p1.display_name} vs ${p2.display_name} at ${event.name}. ${fight.weight_class || ''} bout. Full fight replay available.`;
      const img1 = fight.participants[0].fighter?.vertical_image_url || fight.participants[0].fighter?.thumbnail_url || '';
      const img2 = fight.participants[1].fighter?.vertical_image_url || fight.participants[1].fighter?.thumbnail_url || '';
      const videoUrl = `/api/video-proxy?url=${encodeURIComponent(clipUrl)}`;

      await rawQueryOrThrow(
        `INSERT INTO ufc_replays (title,slug,promotion,event_name,fighter1,fighter2,fighter1_img,fighter2_img,weight_class,result,duration,description,thumbnail,video_url,event_date,featured,published,views,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0,1,0,NOW(),NOW())`,
        [title, slug, promotion, event.name, p1.display_name, p2.display_name,
         img1 ? `${API_BASE}${img1}` : '', img2 ? `${API_BASE}${img2}` : '',
         fight.weight_class || null, result, fight.fight_time || null, desc,
         event.cover_url || null, videoUrl, event.date || null]
      );
      newFights++;
    });

    const elapsed = Date.now() - start;
    console.log('[SCRAPER] Done:', totalEvents, 'events,', totalFights, 'fights,', newFights, 'new,', elapsed, 'ms');
  } catch (err: any) {
    errors.push(`Scrape failed: ${err.message}`);
    console.error('[SCRAPER] Fatal:', err.message);
  }

  return { events: totalEvents, fights: totalFights, newFights, errors };
}
