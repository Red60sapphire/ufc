export interface StreamSource {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  type: 'direct' | 'scraped';
  error?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const SCRAPE_TIMEOUT = 12000;
const VERIFY_TIMEOUT = 8000;

const DIRECT_SOURCES: StreamSource[] = [
  { id: 'soccerball', name: 'Soccer Ball', url: 'https://soccerball.st/rampages/unoairuf/', verified: true, type: 'direct' },
  { id: 'statusnode', name: 'StatusNode', url: 'https://statusnode.is/nodejs/?t=2', verified: true, type: 'direct' },
  { id: 'streamscenter', name: 'Streams Center', url: 'https://streams.center/embed/ch48.php', verified: true, type: 'direct' },
];

let cache: { sources: StreamSource[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

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
    let trimmed = href.trim();
    if (trimmed.startsWith('//')) trimmed = 'https:' + trimmed;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return new URL(trimmed, base).href;
    }
    return trimmed;
  } catch {
    return null;
  }
}

function extractBetween(text: string, before: string, after: string, startIdx = 0): string | null {
  const s = text.indexOf(before, startIdx);
  if (s === -1) return null;
  const e = text.indexOf(after, s + before.length);
  if (e === -1) return null;
  return text.substring(s + before.length, e);
}

function extractAllBetween(text: string, before: string, after: string): string[] {
  const results: string[] = [];
  let idx = 0;
  while (true) {
    const s = text.indexOf(before, idx);
    if (s === -1) break;
    const e = text.indexOf(after, s + before.length);
    if (e === -1) break;
    results.push(text.substring(s + before.length, e));
    idx = e + after.length;
  }
  return results;
}

function containsUfc(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.includes('ufc')) return true;
  if (/\b(mma)\b/.test(lower)) return true;
  return false;
}

function isStreamEmbedUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('.m3u8') ||
    lower.includes('.mp4') ||
    lower.includes('player') ||
    lower.includes('embed') ||
    lower.includes('stream') ||
    lower.includes('live') ||
    lower.includes('watch') ||
    lower.includes('video')
  );
}

async function scrapeAggregator(homepage: string): Promise<string | null> {
  const html = await fetchPage(homepage);
  if (!html) return null;

  const iframes = extractAllBetween(html, '<iframe', '</iframe>');
  for (const iframe of iframes) {
    const src = extractBetween(iframe, 'src="', '"') || extractBetween(iframe, "src='", "'");
    if (src) {
      const full = normalizeUrl(src, homepage);
      if (full && isStreamEmbedUrl(full)) return full;
    }
  }

  const links = extractAllBetween(html, '<a', '</a>');
  const ufcHrefs: string[] = [];

  for (const link of links) {
    const href = extractBetween(link, 'href="', '"') || extractBetween(link, "href='", "'");
    const text = link.replace(/<[^>]*>/g, '').trim();
    if (href && containsUfc(href + ' ' + text)) {
      const full = normalizeUrl(href, homepage);
      if (full) ufcHrefs.push(full);
    }
  }

  for (const url of ufcHrefs) {
    const pageHtml = await fetchPage(url);
    if (!pageHtml) continue;
    const pageIframes = extractAllBetween(pageHtml, '<iframe', '</iframe>');
    for (const iframe of pageIframes) {
      const src = extractBetween(iframe, 'src="', '"') || extractBetween(iframe, "src='", "'");
      if (src) {
        const full = normalizeUrl(src, url);
        if (full && isStreamEmbedUrl(full)) return full;
      }
    }
  }

  return null;
}

export async function discoverSources(force = false): Promise<StreamSource[]> {
  if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.sources;
  }

  const results: StreamSource[] = [...DIRECT_SOURCES];

  const SITES: { id: string; name: string; url: string }[] = [
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

  const scraped = await Promise.allSettled(
    SITES.map(async (site) => {
      const embed = await scrapeAggregator(site.url);
      if (!embed) return null;
      const verified = await verifyUrl(embed);
      return { id: site.id, name: site.name, url: embed, verified, type: 'scraped' as const };
    }),
  );

  for (const result of scraped) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  }

  cache = { sources: results, timestamp: Date.now() };
  return results;
}

export function getDirectSources(): StreamSource[] {
  return [...DIRECT_SOURCES];
}
