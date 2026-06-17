import { rawQueryOrThrow, query } from './db';

const BASE = 'https://mmareplayfull.com';
const API_BASE = 'https://api.mmareplayfull.com';

interface MEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  cover_url: string;
}

interface FightData {
  id: string;
  weight_class: string;
  method: string;
  round: number;
  fight_time: string;
  clip: { clip_id: string; playlist_url: string } | null;
  is_clip_available: boolean;
  participants: { display_name: string; result: string; fighter: { id: string; full_name: string; thumbnail_url: string | null; vertical_image_url: string | null } }[];
  card_name: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function extractNextData(html: string): any {
  const match = html.match(/__NEXT_DATA__.*?application\/json">(.*?)<\/script>/);
  if (!match) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(match[1]);
}

async function fetchEvents(limit = 10): Promise<MEvent[]> {
  const html = await fetchPage(BASE);
  const data = extractNextData(html);
  const latestEvents: any[] = data?.props?.pageProps?.latestEvents || [];
  const available = latestEvents.filter((e: any) => e.is_video_available);
  console.log('[SCRAPER] Homepage:', latestEvents.length, 'events total,', available.length, 'with video, limit', limit);
  return available.slice(0, limit).map((e: any) => ({
    id: e.id, name: e.name, date: e.date, location: e.location || '',
    cover_url: e.cover_url ? `https://api.mmareplayfull.com${e.cover_url}` : '',
  }));
}

function buildEventSlug(event: MEvent): string {
  return `${event.date}-${slugify(event.name)}-${event.id}`;
}

function buildFightSlug(event: MEvent, p1: string, p2: string, fightId: string): string {
  return `${event.date}-${slugify(p1)}-vs-${slugify(p2)}-${fightId}`;
}

function formatDate(d: any): string {
  if (typeof d === 'string') return d.substring(0, 10);
  try { return new Date(d).toISOString().substring(0, 10); } catch { return ''; }
}

export async function scrapeAll(eventLimit = 10): Promise<{
  events: number; fights: number; newFights: number; errors: string[];
}> {
  const errors: string[] = [];
  let totalEvents = 0;
  let totalFights = 0;
  let newFights = 0;

  try {
    const startTime = Date.now();

    // Step 1: get event list from homepage
    const events = await fetchEvents(eventLimit);
    totalEvents = events.length;
    console.log('[SCRAPER] Fetched', totalEvents, 'events in', Date.now() - startTime, 'ms');

    // Step 2: get existing events from DB for dedup
    const existingRows: any[] = await query`SELECT DISTINCT event_name, event_date FROM ufc_replays`;
    const existingEvents = new Set(
      existingRows.map((r: any) => `${r.event_name}|${formatDate(r.event_date)}`)
    );
    console.log('[SCRAPER] DB has', existingEvents.size, 'existing events');

    // Step 3: filter to new events only
    const newEvents = events.filter(e => !existingEvents.has(`${e.name}|${e.date.substring(0, 10)}`));
    const skipped = events.length - newEvents.length;
    console.log('[SCRAPER] Events to process:', newEvents.length, '(skipped', skipped, 'existing)');

    // Step 4: fetch all event pages in parallel (concurrency 5)
    const fightDataArray: { event: MEvent; fights: FightData[] }[] = [];
    const pageQueue = [...newEvents];
    while (pageQueue.length > 0) {
      const batch = pageQueue.splice(0, 5);
      const results = await Promise.all(batch.map(async (event) => {
        try {
          const slug = buildEventSlug(event);
          const html = await fetchPage(`${BASE}/events/${slug}`);
          const data = extractNextData(html);
          const fights: FightData[] = data?.props?.pageProps?.fights || [];
          return { event, fights };
        } catch (err: any) {
          errors.push(`${event.name}: page fetch failed - ${err.message}`);
          return { event, fights: [] as FightData[] };
        }
      }));
      fightDataArray.push(...results);
    }
    console.log('[SCRAPER] All event pages fetched in', Date.now() - startTime, 'ms');

    // Step 5: process fights for each event (events sequential, fights parallel with concurrency 5)
    for (const { event, fights } of fightDataArray) {
      const validFights = fights.filter(f => f.clip && f.is_clip_available && f.participants?.length >= 2);
      totalFights += fights.length;
      const eventStart = Date.now();

      if (validFights.length === 0) continue;

      // Process fights in batches of 5 (parallel)
      const fightQueue = [...validFights];
      while (fightQueue.length > 0) {
        const batch = fightQueue.splice(0, 5);
        const results = await Promise.all(batch.map(async (fight) => {
          const p1 = fight.participants[0];
          const p2 = fight.participants[1];
          const title = `${p1.display_name} vs ${p2.display_name}`;
          const slug = buildFightSlug(event, p1.display_name, p2.display_name, fight.id);

          try {
            // Check slug dedup
            const existing = await query`SELECT id FROM ufc_replays WHERE slug = ${slug}`;
            if (existing.length > 0) return 0;

            const clipUrl = `${API_BASE}${fight.clip!.playlist_url}`;

            // Validate clip URL
            const verify = await fetch(clipUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://mmareplayfull.com/',
              },
            });
            if (!verify.ok) {
              errors.push(`${title}: clip HTTP ${verify.status}`);
              return 0;
            }

            const promotion = event.name.includes('UFC') ? 'UFC' :
              event.name.includes('PFL') ? 'PFL' :
              event.name.includes('ONE') ? 'ONE Championship' :
              event.name.includes('Bellator') ? 'Bellator' : 'UFC';

            const result = fight.method && fight.round ? `${fight.method} Round ${fight.round}` : null;
            const description = `${p1.display_name} vs ${p2.display_name} at ${event.name}. ${fight.weight_class || ''} bout. Full fight replay available.`;
            const fighter1Img = fight.participants[0].fighter?.vertical_image_url || fight.participants[0].fighter?.thumbnail_url || '';
            const fighter2Img = fight.participants[1].fighter?.vertical_image_url || fight.participants[1].fighter?.thumbnail_url || '';
            const videoUrl = `/api/video-proxy?url=${encodeURIComponent(clipUrl)}`;

            await rawQueryOrThrow(
              `INSERT INTO ufc_replays (title, slug, promotion, event_name, fighter1, fighter2, fighter1_img, fighter2_img, weight_class, result, duration, description, thumbnail, video_url, event_date, featured, published, views, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0,1,0,NOW(),NOW())`,
              [
                title, slug, promotion, event.name,
                p1.display_name, p2.display_name,
                fighter1Img ? `${API_BASE}${fighter1Img}` : '',
                fighter2Img ? `${API_BASE}${fighter2Img}` : '',
                fight.weight_class || null,
                result, fight.fight_time || null,
                description, event.cover_url || null,
                videoUrl, event.date || null,
              ]
            );
            return 1;
          } catch (err: any) {
            errors.push(`${title}: ${err.message}`);
            return 0;
          }
        }));

        newFights += results.reduce((a: number, b: number) => a + b, 0);
      }
      console.log('[SCRAPER]', event.name, 'processed in', Date.now() - eventStart, 'ms');
    }

    const elapsed = Date.now() - startTime;
    console.log('[SCRAPER] Complete:', totalEvents, 'events,', totalFights, 'fights,', newFights, 'new,', elapsed, 'ms');
  } catch (err: any) {
    errors.push(`Scrape failed: ${err.message}`);
    console.error('[SCRAPER] Fatal:', err.message);
  }

  return { events: totalEvents, fights: totalFights, newFights, errors };
}
