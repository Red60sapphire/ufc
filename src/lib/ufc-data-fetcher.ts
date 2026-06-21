import { ufcConfig } from './ufc-config';

export interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  venue?: string;
  location?: string;
  status?: string;
  statusState?: string;
  fighter1?: string;
  fighter2?: string;
  fighter1Record?: string;
  fighter2Record?: string;
  fighter1Img?: string;
  fighter2Img?: string;
  broadcast?: string;
  weightClass?: string;
  fights?: any[];
}

export interface ESPNNews {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: string;
  source?: string;
  url?: string;
}

export interface ESPNAthlete {
  id: string;
  name: string;
  nickname?: string;
  record?: string;
  height?: string;
  weight?: string;
  weightClass?: string;
  reach?: string;
  stance?: string;
  age?: number;
  country?: string;
  flag?: string;
  image?: string;
}

export interface ESPNRankEntry {
  rank: number;
  trend: string;
  athleteId: string;
  athlete?: ESPNAthlete;
}

export interface ESPNRankingGroup {
  id: string;
  name: string;
  ranks: ESPNRankEntry[];
}

const CACHE_TTL = 600;
const ESP_BASE = 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc';
const CORE_BASE = 'https://sports.core.api.espn.com/v2/sports/mma';
const LEAGUE_BASE = `${CORE_BASE}/leagues/ufc`;

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

function buildHeadshotUrl(athleteId: string) {
  return `https://a.espncdn.com/i/headshots/mma/players/full/${athleteId}.png`;
}

function getCompRecord(competitor: any): string {
  return competitor?.records?.[0]?.summary || 'N/A';
}

function mapCompetition(c: any) {
  const comp1 = c?.competitors?.[0];
  const comp2 = c?.competitors?.[1];
  const f1 = comp1?.athlete;
  const f2 = comp2?.athlete;
  const athleteId1 = f1?.id || comp1?.id;
  const athleteId2 = f2?.id || comp2?.id;
  return {
    id: c.id,
    order: c.order || 0,
    fighter1: f1?.displayName || 'TBD',
    fighter2: f2?.displayName || 'TBD',
    fighter1Record: getCompRecord(comp1),
    fighter2Record: getCompRecord(comp2),
    fighter1Img: athleteId1 ? buildHeadshotUrl(athleteId1) : undefined,
    fighter2Img: athleteId2 ? buildHeadshotUrl(athleteId2) : undefined,
    fighter1Id: athleteId1,
    fighter2Id: athleteId2,
    weightClass: c.type?.abbreviation || c.description || '',
    broadcast: c.broadcast || c.broadcasts?.[0]?.names?.[0],
    status: c.status?.type?.description,
    statusState: c.status?.type?.state,
  };
}

export async function getUpcomingEvents(limit = 6): Promise<ESPNEvent[]> {
  try {
    const data = await espnFetch(`${ESP_BASE}/scoreboard`);
    const apiEvents = data?.events || [];
    return apiEvents.slice(0, limit).map((e: any) => {
      const comps = e.competitions || [];
      const mainFight = comps[comps.length - 1];
      const f1 = mainFight?.competitors?.[0]?.athlete;
      const mainComp1 = mainFight?.competitors?.[0];
      const mainComp2 = mainFight?.competitors?.[1];
      const mf1 = mainComp1?.athlete;
      const mf2 = mainComp2?.athlete;
      const mainAthleteId1 = mf1?.id || mainComp1?.id;
      const mainAthleteId2 = mf2?.id || mainComp2?.id;
      return {
        id: e.id,
        name: e.name,
        date: e.date,
        venue: e.venues?.[0]?.fullName || comps[0]?.venue?.fullName,
        location: e.venues?.[0]?.address ? `${e.venues[0].address.city || ''}, ${e.venues[0].address.state || ''}`.replace(/^,\s*$/, '') : comps[0]?.venue?.address ? `${comps[0].venue.address.city || ''}, ${comps[0].venue.address.state || ''}`.replace(/^,\s*$/, '') : '',
        status: mainFight?.status?.type?.description,
        statusState: mainFight?.status?.type?.state,
        broadcast: mainFight?.broadcast || mainFight?.broadcasts?.[0]?.names?.[0],
        fighter1: mf1?.displayName,
        fighter2: mf2?.displayName,
        fighter1Record: getCompRecord(mainComp1),
        fighter2Record: getCompRecord(mainComp2),
        fighter1Img: mainAthleteId1 ? buildHeadshotUrl(mainAthleteId1) : undefined,
        fighter2Img: mainAthleteId2 ? buildHeadshotUrl(mainAthleteId2) : undefined,
        weightClass: mainFight?.type?.abbreviation || mainFight?.description,
        fights: comps.map(mapCompetition),
      };
    });
  } catch {
    return [];
  }
}

export async function getFightCard(eventId: string): Promise<{ main: any[]; prelims: any[]; early: any[] }> {
  try {
    const data = await espnFetch(`${ESP_BASE}/scoreboard`);
    const event = data?.events?.find((e: any) => e.id === eventId);
    if (!event?.competitions) return { main: [], prelims: [], early: [] };

    const sorted = [...event.competitions].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const fights = sorted.map(mapCompetition);

    return {
      main: fights.slice(-5).reverse(),
      prelims: fights.slice(-9, -5).reverse(),
      early: fights.slice(0, -9).reverse(),
    };
  } catch {
    return { main: [], prelims: [], early: [] };
  }
}

export async function getLatestNews(limit = 5): Promise<ESPNNews[]> {
  try {
    const data = await espnFetch(`${ESP_BASE}/news?limit=${limit}`);
    const articles = data?.articles || [];
    return articles.slice(0, limit).map((a: any) => ({
      id: a.id || String(Math.random()),
      title: a.headline || a.title,
      description: a.description,
      image: a.images?.[0]?.url || a.images?.[0]?.href,
      date: a.published || a.date,
      source: a.source || 'ESPN',
      url: a.links?.web?.href || a.links?.web,
    }));
  } catch {
    return [];
  }
}

export async function getAthlete(id: string): Promise<ESPNAthlete | null> {
  try {
    const data = await espnFetch(`${CORE_BASE}/athletes/${id}`);
    let record = 'N/A';
    try {
      const recordsData = await espnFetch(`${CORE_BASE}/athletes/${id}/records`);
      record = recordsData?.items?.[0]?.summary || `${data.record?.wins || 0}-${data.record?.losses || 0}-${data.record?.draws || 0}`;
    } catch {}

    return {
      id: data.id,
      name: data.displayName || data.fullName,
      nickname: data.nickname,
      record,
      height: data.displayHeight,
      weight: data.displayWeight,
      weightClass: data.weightClass?.text,
      reach: data.displayReach,
      stance: data.stance?.text,
      age: data.age,
      country: data.citizenship || data.country?.displayName,
      flag: data.flag?.href,
      image: data.headshot?.href || buildHeadshotUrl(id),
    };
  } catch {
    return null;
  }
}

export async function getRankings(): Promise<ESPNRankingGroup[]> {
  try {
    const list = await espnFetch(`${LEAGUE_BASE}/rankings`);
    const refs: { url: string; name: string }[] = (list?.items || []).map((item: any) => ({
      url: item.$ref,
      name: item.$ref.split('/').pop()?.split('?')[0] || '',
    }));

    const groups = await Promise.all(
      refs.map(async (ref) => {
        try {
          const data = await espnFetch(ref.url);
          if (!data?.ranks) return null;
          const ranks = data.ranks.slice(0, 15).map((r: any) => ({
            rank: r.current,
            trend: r.trend || '-',
            athleteId: r.athlete?.$ref?.split('/').pop()?.split('?')[0] || '',
          }));
          return { id: data.id, name: data.shortName || data.name, ranks } as ESPNRankingGroup;
        } catch {
          return null;
        }
      })
    );

    return groups.filter(Boolean) as ESPNRankingGroup[];
  } catch {
    return [];
  }
}

export async function getRankingsWithAthletes(): Promise<ESPNRankingGroup[]> {
  const groups = await getRankings();
  const enriched = await Promise.all(
    groups.map(async (group) => {
      const athletes = await Promise.all(
        group.ranks.map(async (entry) => {
          if (!entry.athleteId) return { ...entry, athlete: undefined };
          const athlete = await getAthlete(entry.athleteId);
          return { ...entry, athlete: athlete || undefined };
        })
      );
      return { ...group, ranks: athletes };
    })
  );
  return enriched;
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
    fighter1: config.main_event.fighter1,
    fighter2: config.main_event.fighter2,
    fighter1Record: config.main_event.fighter1_record,
    fighter2Record: config.main_event.fighter2_record,
    fighter1Img: config.main_event.fighter1_img,
    fighter2Img: config.main_event.fighter2_img,
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
