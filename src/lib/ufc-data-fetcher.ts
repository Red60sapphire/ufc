import { ufcConfig } from './ufc-config';

interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  venue?: string;
  location?: string;
  status?: string;
  fights?: any[];
}

interface ESPNNews {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: string;
  source?: string;
  url?: string;
}

interface ESPNAthlete {
  id: string;
  name: string;
  record?: string;
  height?: string;
  weight?: string;
  reach?: string;
  stance?: string;
  age?: number;
  country?: string;
  flag?: string;
  image?: string;
}

const CACHE_TTL = 600;
const ESP_BASE = 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc';
const CORE_API = 'https://sports.core.api.espn.com/v2/sports/mma/athletes';

function getCached(key: string): any | null {
  try {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const cacheDir = path.join(require('os').tmpdir(), 'ufc-cache');
      const file = path.join(cacheDir, `espn_${Buffer.from(key).toString('hex')}.json`);
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (Date.now() - data.timestamp < CACHE_TTL * 1000) {
          return data.data;
        }
      }
    }
  } catch {}
  return null;
}

function setCache(key: string, data: any) {
  try {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const cacheDir = path.join(require('os').tmpdir(), 'ufc-cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const file = path.join(cacheDir, `espn_${Buffer.from(key).toString('hex')}.json`);
      fs.writeFileSync(file, JSON.stringify({ data, timestamp: Date.now() }));
    }
  } catch {}
}

async function espnFetch(url: string): Promise<any> {
  const cached = getCached(url);
  if (cached) return cached;

  try {
    const res = await fetch(url, { next: { revalidate: CACHE_TTL } });
    if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
    const data = await res.json();
    setCache(url, data);
    return data;
  } catch (err) {
    const stale = getCached(url);
    if (stale) return stale;
    throw err;
  }
}

export async function getUpcomingEvents(limit = 6): Promise<ESPNEvent[]> {
  try {
    const data = await espnFetch(`${ESP_BASE}/scoreboard`);
    const events = data?.events || [];
    return events.slice(0, limit).map((e: any) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      venue: e.competitions?.[0]?.venue?.fullName,
      location: `${e.competitions?.[0]?.venue?.address?.city || ''}, ${e.competitions?.[0]?.venue?.address?.state || ''}`.replace(/^,\s*$/, ''),
      status: e.competitions?.[0]?.status?.type?.description,
      fights: e.competitions?.map((c: any) => ({
        id: c.id,
        fighter1: c.competitors?.[0]?.athlete?.displayName,
        fighter2: c.competitors?.[1]?.athlete?.displayName,
        fighter1Record: c.competitors?.[0]?.record,
        fighter2Record: c.competitors?.[1]?.record,
        fighter1Img: c.competitors?.[0]?.athlete?.flag?.href,
        fighter2Img: c.competitors?.[1]?.athlete?.flag?.href,
        weightClass: c.weightClass || c.description,
      })),
    }));
  } catch {
    return [];
  }
}

export async function getFightCard(eventId: string): Promise<{ main: any[]; prelims: any[]; early: any[] }> {
  try {
    const data = await espnFetch(`${ESP_BASE}/scoreboard`);
    const event = data?.events?.find((e: any) => e.id === eventId);
    if (!event?.competitions) return { main: [], prelims: [], early: [] };

    const competitions = [...event.competitions].reverse();
    const fights = competitions.map((c: any) => ({
      id: c.id,
      fighter1: c.competitors?.[0]?.athlete?.displayName || 'TBD',
      fighter2: c.competitors?.[1]?.athlete?.displayName || 'TBD',
      fighter1Record: c.competitors?.[0]?.record || 'N/A',
      fighter2Record: c.competitors?.[1]?.record || 'N/A',
      fighter1Img: c.competitors?.[0]?.athlete?.flag?.href,
      fighter2Img: c.competitors?.[1]?.athlete?.flag?.href,
      weightClass: c.description || c.weightClass || '',
    }));

    return {
      main: fights.slice(0, 5),
      prelims: fights.slice(5, 9),
      early: fights.slice(9),
    };
  } catch {
    return { main: [], prelims: [], early: [] };
  }
}

export async function getLatestNews(limit = 5): Promise<ESPNNews[]> {
  try {
    const data = await espnFetch(`${ESP_BASE}/news`);
    const articles = data?.articles || [];
    return articles.slice(0, limit).map((a: any) => ({
      id: a.id || String(Math.random()),
      title: a.headline || a.title,
      description: a.description,
      image: a.images?.[0]?.url,
      date: a.published || a.date,
      source: a.source || 'ESPN',
      url: a.links?.web?.href,
    }));
  } catch {
    return [];
  }
}

export async function getAthlete(id: string): Promise<ESPNAthlete | null> {
  try {
    const data = await espnFetch(`${CORE_API}/${id}`);
    return {
      id: data.id,
      name: data.displayName || data.fullName,
      record: `${data.record?.wins || 0}-${data.record?.losses || 0}-${data.record?.draws || 0}`,
      height: data.height,
      weight: data.weight,
      reach: data.reach,
      stance: data.stance,
      age: data.age,
      country: data.country?.displayName,
      flag: data.country?.flag,
      image: `https://a.espncdn.com/i/headshots/mma/players/full/${id}.png`,
    };
  } catch {
    return null;
  }
}

export async function getEventsWithFightCards(limit = 6): Promise<ESPNEvent[]> {
  const events = await getUpcomingEvents(limit);
  const enriched = await Promise.all(
    events.map(async (e) => {
      const fightCard = await getFightCard(e.id);
      return { ...e, fights: fightCard.main || [] };
    })
  );
  if (enriched.length > 0) return enriched;

  const config = ufcConfig.current_event;
  return [{
    id: '1',
    name: config.name,
    date: config.date,
    venue: config.venue,
    location: 'Las Vegas, Nevada',
    status: 'Upcoming',
    fights: config.fight_card.main.map((f, i) => ({
      ...f, id: String(i),
      fighter1Img: `https://a.espncdn.com/i/headshots/mma/players/full/${i + 1}.png`,
      fighter2Img: `https://a.espncdn.com/i/headshots/mma/players/full/${i + 10}.png`,
    })),
  }];
}

export async function getNewsWithFallback(limit = 5): Promise<ESPNNews[]> {
  const news = await getLatestNews(limit);
  if (news.length > 0) return news;
  return ufcConfig.news.map((n) => ({
    ...n, source: 'UFC News', url: '#',
  }));
}
