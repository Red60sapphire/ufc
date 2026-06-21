export interface StreamSource {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  eventName?: string;
  eventDate?: string;
  error?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const SCRAPE_TIMEOUT = 10000;
const VERIFY_TIMEOUT = 6000;

const SITES = [
  { id: 'soccerball', name: 'Soccer Ball', url: 'https://soccerball.st/rampages/unoairuf/' },
  { id: 'statusnode', name: 'StatusNode', url: 'https://statusnode.is/nodejs/?t=2' },
  { id: 'streamscenter', name: 'Streams Center', url: 'https://streams.center/embed/ch48.php' },
  { id: 'totalsportek', name: 'TOTALSPORTEK', url: 'https://www.totalsportekpro.com/' },
  { id: 'streameast', name: 'StreamEast', url: 'https://www.streameast100.com/' },
  { id: 'footybite', name: 'Footybite', url: 'https://www.footybite.to/' },
  { id: 'nflbite', name: 'NFLBITE', url: 'https://www.nflbite.to/' },
  { id: 'nbabite', name: 'NBABITE', url: 'https://reddit.nbabite.to/' },
  { id: 'sportsurge', name: 'Sportsurge', url: 'https://sportsurge100.com/' },
  { id: 'hesgoal', name: 'Hesgoal', url: 'https://hesgoalfree.com/' },
  { id: 'footballstreams', name: 'Football Streams', url: 'https://footballstreams.top/' },
  { id: 'crackstreams', name: 'CrackStreams', url: 'https://crackstreams.one/' },
  { id: 'methstreams', name: 'MethStreams', url: 'https://www.methstreams.pro/' },
  { id: 'soccerstreams', name: 'Soccer Streams', url: 'https://www.soccerstreams-free.com/' },
  { id: 'f1streams', name: 'F1 Streams', url: 'https://www.f1streamsfree.com/' },
  { id: 'freestreams', name: 'Free Streams', url: 'https://freestreams-live.top/' },
  { id: 'hufoot', name: 'Hoofoot', url: 'https://hufoot.com/' },
  { id: 'stream2watch', name: 'Stream2Watch', url: 'https://stream2watch.football/' },
];

async function fetchPage(url: string, timeout = SCRAPE_TIMEOUT): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function verifyUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeUrl(href: string, base: string): string | null {
  try {
    let t = href.trim();
    if (t.startsWith('//')) t = 'https:' + t;
    if (!t.startsWith('http')) return new URL(t, base).href;
    return t;
  } catch { return null; }
}

function extractBetween(text: string, before: string, after: string, start = 0): string | null {
  const s = text.indexOf(before, start);
  if (s === -1) return null;
  const e = text.indexOf(after, s + before.length);
  return e === -1 ? null : text.substring(s + before.length, e);
}

function extractAllBetween(text: string, before: string, after: string): string[] {
  const out: string[] = [];
  let idx = 0;
  while (true) {
    const s = text.indexOf(before, idx);
    if (s === -1) break;
    const e = text.indexOf(after, s + before.length);
    if (e === -1) break;
    out.push(text.substring(s + before.length, e));
    idx = e + after.length;
  }
  return out;
}

function hasUfc(text: string): boolean {
  return text.toLowerCase().includes('ufc') || /\bmma\b/i.test(text);
}

function isStreamUrl(url: string): boolean {
  const l = url.toLowerCase();
  return /\.(m3u8|mp4|webm|flv)/.test(l) || /(player|embed|stream|live|watch)/.test(l);
}

async function getCurrentEventInfo(): Promise<{ name: string; date: string } | null> {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard', {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const event = data?.events?.[0];
      if (event) {
        return {
          name: event.name || event.shortName || '',
          date: event.date ? event.date.split('T')[0] : '',
        };
      }
    }
  } catch {}
  return null;
}

function tryExtractEmbeds(html: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const iframes = extractAllBetween(html, '<iframe', '</iframe>');
  for (const f of iframes) {
    const src = extractBetween(f, 'src="', '"') || extractBetween(f, "src='", "'");
    if (src && !seen.has(src)) { seen.add(src); found.push(src); }
  }
  const anchors = extractAllBetween(html, '<a', '</a>');
  for (const a of anchors) {
    const href = extractBetween(a, 'href="', '"') || extractBetween(a, "href='", "'");
    const text = a.replace(/<[^>]*>/g, '').trim();
    if (href && !seen.has(href) && isStreamUrl(href + ' ' + text)) { seen.add(href); found.push(href); }
  }
  const sources = extractAllBetween(html, '<source', '>');
  for (const s of sources) {
    const src = extractBetween(s, 'src="', '"') || extractBetween(s, "src='", "'");
    if (src && !seen.has(src)) { seen.add(src); found.push(src); }
  }
  return found;
}

async function scrapeOne(site: { id: string; name: string; url: string }): Promise<StreamSource | null> {
  const html = await fetchPage(site.url);
  if (!html) return null;

  let embedUrl: string | null = null;

  const embeds = tryExtractEmbeds(html);
  const streamEmbeds = embeds.filter(e => isStreamUrl(e));
  if (streamEmbeds.length > 0) {
    embedUrl = streamEmbeds[0];
  }

  if (!embedUrl) {
    const links = extractAllBetween(html, '<a', '</a>');
    const ufcLinks: string[] = [];
    for (const link of links) {
      const href = extractBetween(link, 'href="', '"') || extractBetween(link, "href='", "'");
      const text = link.replace(/<[^>]*>/g, '').trim();
      if (href && hasUfc(href + ' ' + text)) {
        const full = normalizeUrl(href, site.url);
        if (full) ufcLinks.push(full);
      }
    }

    for (const linkUrl of ufcLinks) {
      const page = await fetchPage(linkUrl);
      if (!page) continue;
      const pageEmbeds = tryExtractEmbeds(page);
      const pageStream = pageEmbeds.find(e => isStreamUrl(e));
      if (pageStream) { embedUrl = pageStream; break; }
    }
  }

  if (!embedUrl) {
    const anchors = extractAllBetween(html, '<a', '</a>');
    const allLinks: string[] = [];
    for (const a of anchors) {
      const href = extractBetween(a, 'href="', '"') || extractBetween(a, "href='", "'");
      if (href) {
        const full = normalizeUrl(href, site.url);
        if (full && !full.includes('javascript:')) allLinks.push(full);
      }
    }
    const scheduleKeywords = ['schedule', 'events', 'live', 'today', 'now', 'stream'];
    for (const link of allLinks) {
      if (scheduleKeywords.some(k => link.toLowerCase().includes(k))) {
        const page = await fetchPage(link);
        if (!page) continue;
        const pageEmbeds = tryExtractEmbeds(page);
        const pageStream = pageEmbeds.find(e => isStreamUrl(e));
        if (pageStream) { embedUrl = pageStream; break; }
      }
    }
  }

  if (!embedUrl) return null;

  const fullUrl = normalizeUrl(embedUrl, site.url);
  if (!fullUrl) return null;
  const verified = await verifyUrl(fullUrl);
  return { id: site.id, name: site.name, url: fullUrl, verified };
}

export async function scrapeAllSites(saveToDb?: (sources: StreamSource[]) => Promise<void>): Promise<{
  sources: StreamSource[];
  eventInfo: { name: string; date: string } | null;
  logs: string[];
}> {
  const logs: string[] = [];
  log(`Scraping ${SITES.length} sites...`);

  const eventInfo = await getCurrentEventInfo();
  if (eventInfo) log(`Event: ${eventInfo.name} (${eventInfo.date})`);
  else log('No event info from ESPN');

  const batchSize = 6;
  const allSources: StreamSource[] = [];

  for (let i = 0; i < SITES.length; i += batchSize) {
    const batch = SITES.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(s => scrapeOne(s)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled' && r.value) {
        const s = { ...r.value, eventName: eventInfo?.name, eventDate: eventInfo?.date };
        allSources.push(s);
        log(`${batch[j].name}: ${s.url} (${s.verified ? 'verified' : 'unverified'})`);
      } else {
        log(`${batch[j].name}: no embed found`);
      }
    }
  }

  log(`Total found: ${allSources.length}/${SITES.length}`);

  if (saveToDb && allSources.length > 0) {
    await saveToDb(allSources.map(s => ({ ...s, eventName: eventInfo?.name, eventDate: eventInfo?.date })));
    log('Saved to database');
  }

  return { sources: allSources, eventInfo, logs };
}

function log(msg: string) {
  console.log('[STREAM-SCRAPER]', msg);
}
