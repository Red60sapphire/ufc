export interface StreamSource {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  type: 'direct' | 'scraped';
  error?: string;
}

interface ScrapeTarget {
  id: string;
  name: string;
  homepage: string;
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

const SCRAPE_TARGETS: ScrapeTarget[] = [
  { id: 'totalsportek', name: 'TOTALSPORTEK', homepage: 'https://www.totalsportekpro.com/' },
  { id: 'streameast', name: 'StreamEast', homepage: 'https://www.streameast100.com/' },
  { id: 'footybite', name: 'Footybite', homepage: 'https://www.footybite.to/' },
  { id: 'soccerstreams', name: 'Soccer Streams', homepage: 'https://www.soccerstreams-free.com/' },
  { id: 'f1streams', name: 'F1 Streams', homepage: 'https://www.f1streamsfree.com/' },
  { id: 'nbabite', name: 'NBABITE', homepage: 'https://reddit.nbabite.to/' },
];

let cache: { sources: StreamSource[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchPage(url: string, timeout = SCRAPE_TIMEOUT): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
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

function extractBetween(text: string, before: string, after: string, startIdx = 0): string | null {
  const s = text.indexOf(before, startIdx);
  if (s === -1) return null;
  const e = text.indexOf(after, s + before.length);
  if (e === -1) return null;
  return text.substring(s + before.length, e);
}

function extractAllLinks(html: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const regex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (href && text) {
      links.push({ href, text });
    }
  }
  return links;
}

function extractIframeSrc(html: string): string | null {
  const regex = /<iframe[^>]*src="([^"]*)"[^>]*>/i;
  const match = regex.exec(html);
  return match ? match[1] : null;
}

async function scrapeAggregator(target: ScrapeTarget): Promise<StreamSource | null> {
  try {
    const html = await fetchPage(target.homepage);
    const links = extractAllLinks(html);

    const ufcLinks = links.filter(
      l => /ufc/i.test(l.href) || /ufc/i.test(l.text),
    );

    if (ufcLinks.length === 0) return null;

    const firstUfc = ufcLinks[0];
    const fullUrl = firstUfc.href.startsWith('http')
      ? firstUfc.href
      : new URL(firstUfc.href, target.homepage).href;

    const eventHtml = await fetchPage(fullUrl);
    const embedSrc = extractIframeSrc(eventHtml);

    if (!embedSrc) return null;

    const verified = await verifyUrl(embedSrc);
    return {
      id: target.id,
      name: target.name,
      url: embedSrc,
      verified,
      type: 'scraped',
    };
  } catch (err: any) {
    return {
      id: target.id,
      name: target.name,
      url: target.homepage,
      verified: false,
      type: 'scraped',
      error: err.message,
    };
  }
}

export async function discoverSources(force = false): Promise<StreamSource[]> {
  if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.sources;
  }

  const results: StreamSource[] = [...DIRECT_SOURCES];

  const scraped = await Promise.allSettled(
    SCRAPE_TARGETS.map(t => scrapeAggregator(t)),
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
  return DIRECT_SOURCES;
}
