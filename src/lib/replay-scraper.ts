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

interface ClipData {
  clip_id: string;
  playlist_url: string;
  start_seconds: number;
  end_seconds: number;
}

interface FightParticipant {
  display_name: string;
  result: string;
  fighter: {
    id: string;
    full_name: string;
    thumbnail_url: string | null;
    vertical_image_url: string | null;
  };
}

interface FightData {
  id: string;
  weight_class: string;
  method: string;
  round: number;
  fight_time: string;
  clip: ClipData | null;
  is_clip_available: boolean;
  participants: FightParticipant[];
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

async function fetchEvents(): Promise<MEvent[]> {
  const html = await fetchPage(BASE);
  const data = extractNextData(html);
  const latestEvents: any[] = data?.props?.pageProps?.latestEvents || [];
  return latestEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    location: e.location || '',
    cover_url: e.cover_url ? `https://api.mmareplayfull.com${e.cover_url.replace('/cover_art', '/cover_art')}` : '',
  }));
}

function buildEventSlug(event: MEvent): string {
  return `${event.date}-${slugify(event.name)}-${event.id}`;
}

async function fetchFights(event: MEvent): Promise<FightData[]> {
  const slug = buildEventSlug(event);
  const html = await fetchPage(`${BASE}/events/${slug}`);
  const data = extractNextData(html);
  return data?.props?.pageProps?.fights || [];
}

function buildFightSlug(event: MEvent, fight: FightData): string {
  const p1 = slugify(fight.participants[0]?.display_name || 'fighter1');
  const p2 = slugify(fight.participants[1]?.display_name || 'fighter2');
  return `${event.date}-${p1}-vs-${p2}-${fight.id}`;
}

function buildResult(fight: FightData): string {
  if (fight.method && fight.round) {
    return `${fight.method} Round ${fight.round}`;
  }
  return '';
}

function buildDescription(event: MEvent, fight: FightData): string {
  const p1 = fight.participants[0]?.display_name || 'Fighter 1';
  const p2 = fight.participants[1]?.display_name || 'Fighter 2';
  return `${p1} vs ${p2} at ${event.name}. ${fight.weight_class} bout. Full fight replay available.`;
}

function getFighterImg(participant: FightParticipant): string {
  if (participant.fighter?.vertical_image_url) {
    return `${API_BASE}${participant.fighter.vertical_image_url}`;
  }
  if (participant.fighter?.thumbnail_url) {
    return `${API_BASE}${participant.fighter.thumbnail_url}`;
  }
  return '';
}

export async function scrapeAll(): Promise<{
  events: number;
  fights: number;
  newFights: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalEvents = 0;
  let totalFights = 0;
  let newFights = 0;

  try {
    const events = await fetchEvents();
    totalEvents = events.length;

    for (const event of events) {
      try {
        const fights = await fetchFights(event);
        totalFights += fights.length;

        for (const fight of fights) {
          try {
            if (!fight.clip || !fight.is_clip_available) continue;
            if (fight.participants.length < 2) continue;

            const p1 = fight.participants[0];
            const p2 = fight.participants[1];
            const title = `${p1.display_name} vs ${p2.display_name}`;
            const slug = buildFightSlug(event, fight);

            const existing = await query`SELECT id FROM ufc_replays WHERE slug = ${slug}`;
            if (existing.length > 0) continue;

            const promotion = event.name.includes('UFC') ? 'UFC' :
              event.name.includes('PFL') ? 'PFL' :
              event.name.includes('ONE') ? 'ONE Championship' :
              event.name.includes('Bellator') ? 'Bellator' : 'UFC';

            const clipUrl = `${API_BASE}${fight.clip.playlist_url}`;
            const videoUrl = `/api/video-proxy?url=${encodeURIComponent(clipUrl)}`;

            await rawQueryOrThrow(
              `INSERT INTO ufc_replays (title, slug, promotion, event_name, fighter1, fighter2, fighter1_img, fighter2_img, weight_class, result, duration, description, thumbnail, video_url, event_date, featured, published, views, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, 1, 0, NOW(), NOW())`,
              [
                title, slug, promotion, event.name,
                p1.display_name, p2.display_name,
                getFighterImg(p1), getFighterImg(p2),
                fight.weight_class || null,
                buildResult(fight) || null,
                fight.fight_time || null,
                buildDescription(event, fight) || null,
                event.cover_url || null,
                videoUrl,
                event.date || null,
              ]
            );

            newFights++;
          } catch (err: any) {
            errors.push(`Fight ${fight.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`Event ${event.id} (${event.name}): ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Scrape failed: ${err.message}`);
  }

  return { events: totalEvents, fights: totalFights, newFights, errors };
}
