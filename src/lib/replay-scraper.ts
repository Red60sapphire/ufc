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

async function fetchAllAvailableEvents(): Promise<MEvent[]> {
  const html = await fetchPage(BASE);
  const data = extractNextData(html);
  const all: any[] = data?.props?.pageProps?.latestEvents || [];
  const avail = all.filter((e: any) => e.is_video_available);
  console.log('[SCRAPER] Homepage:', all.length, 'total,', avail.length, 'with video');
  return avail.map((e: any) => ({
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

export async function scrapeAll(maxEvents = 30): Promise<{
  events: number; fights: number; newFights: number; errors: string[];
}> {
  const errors: string[] = [];
  let totalFights = 0;
  let newFights = 0;
  let eventsScanned = 0;
  let eventsWithClips = 0;

  try {
    const start = Date.now();

    // 1) Get all available events from homepage
    const allEvents = await fetchAllAvailableEvents();

    // 2) Dedup against existing events in DB
    const existingRows: any[] = await query`SELECT DISTINCT event_name, event_date FROM ufc_replays`;
    const existingEvents = new Set(
      existingRows.map((r: any) => `${r.event_name}|${formatDate(r.event_date)}`)
    );
    const newEvents = allEvents.filter(e => !existingEvents.has(`${e.name}|${e.date.substring(0, 10)}`));
    console.log('[SCRAPER] New events:', newEvents.length, '(skipped', allEvents.length - newEvents.length, ')');

    if (newEvents.length === 0) {
      return { events: 0, fights: 0, newFights: 0, errors };
    }

    // 3) Batch-fetch event pages (10 at a time) until we find enough clips
    const toScan = newEvents.slice(0, maxEvents);
    eventsScanned = 0;
    eventsWithClips = 0;
    const fightSources: { event: MEvent; fights: FightData[] }[] = [];

    while (eventsScanned < toScan.length) {
      const batch = toScan.slice(eventsScanned, eventsScanned + 10);
      eventsScanned += batch.length;

      const pageResults = await Promise.all(batch.map(async (event) => {
        try {
          const slug = buildEventSlug(event);
          const html = await fetchPage(`${BASE}/events/${slug}`);
          const data = extractNextData(html);
          const fights: FightData[] = data?.props?.pageProps?.fights || [];
          return { event, fights, error: null as string | null };
        } catch (err: any) {
          return { event, fights: [] as FightData[], error: err.message };
        }
      }));

      for (const pr of pageResults) {
        if (pr.error) { errors.push(`${pr.event.name}: ${pr.error}`); continue; }
        totalFights += pr.fights.length;
        const valid = pr.fights.filter(f => f.clip && f.is_clip_available && f.participants?.length >= 2);
        if (valid.length > 0) {
          eventsWithClips++;
          fightSources.push({ event: pr.event, fights: valid });
          console.log('[SCRAPER]  ', pr.event.name, '-', valid.length, 'clips');
        } else {
          console.log('[SCRAPER]  ', pr.event.name, '- 0 clips');
        }
      }
    }

    console.log('[SCRAPER] Scanned', eventsScanned, 'events,', eventsWithClips, 'with clips in', Date.now() - start, 'ms');

    // 4) Process fights from events that have clips (sequential per event, skip slug dupes)
    for (const { event, fights } of fightSources) {
      for (const fight of fights) {
        try {
          const p1 = fight.participants[0];
          const p2 = fight.participants[1];
          const title = `${p1.display_name} vs ${p2.display_name}`;
          const fightSlug = `${event.date}-${slugify(p1.display_name)}-vs-${slugify(p2.display_name)}-${fight.id}`;

          const existing = await query`SELECT id FROM ufc_replays WHERE slug = ${fightSlug}`;
          if (existing.length > 0) continue;

          const clipUrl = `${API_BASE}${fight.clip!.playlist_url}`;

          const verify = await fetch(clipUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://mmareplayfull.com/',
            },
          });
          if (!verify.ok) { errors.push(`${title}: clip ${verify.status}`); continue; }

          const promotion = event.name.includes('UFC') ? 'UFC' :
            event.name.includes('PFL') ? 'PFL' :
            event.name.includes('ONE') ? 'ONE Championship' :
            event.name.includes('Bellator') ? 'Bellator' : 'UFC';

          const result = fight.method && fight.round ? `${fight.method} Round ${fight.round}` : null;
          const desc = `${p1.display_name} vs ${p2.display_name} at ${event.name}. ${fight.weight_class || ''} bout.`;
          const img1 = p1.fighter?.vertical_image_url || p1.fighter?.thumbnail_url || '';
          const img2 = p2.fighter?.vertical_image_url || p2.fighter?.thumbnail_url || '';
          const videoUrl = `/api/video-proxy?url=${encodeURIComponent(clipUrl)}`;

          await rawQueryOrThrow(
            `INSERT INTO ufc_replays (title,slug,promotion,event_name,fighter1,fighter2,fighter1_img,fighter2_img,weight_class,result,duration,description,thumbnail,video_url,event_date,featured,published,views,created_at,updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0,1,0,NOW(),NOW())`,
            [title, fightSlug, promotion, event.name, p1.display_name, p2.display_name,
             img1 ? `${API_BASE}${img1}` : '', img2 ? `${API_BASE}${img2}` : '',
             fight.weight_class || null, result, fight.fight_time || null, desc,
             event.cover_url || null, videoUrl, event.date || null]
          );
          newFights++;
        } catch (err: any) {
          errors.push(`Fight ${fight.id}: ${err.message}`);
        }
      }
    }

    const elapsed = Date.now() - start;
    console.log('[SCRAPER] Done:', eventsScanned, 'scanned,', eventsWithClips, 'with clips,', newFights, 'new,', elapsed, 'ms');
  } catch (err: any) {
    errors.push(`Scrape failed: ${err.message}`);
    console.error('[SCRAPER] Fatal:', err.message);
  }

  return { events: eventsScanned, fights: totalFights, newFights, errors };
}
