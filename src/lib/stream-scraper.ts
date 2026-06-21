export interface StreamSource {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  eventName?: string;
  eventDate?: string;
  error?: string;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const FAST_TIMEOUT = 4000;
const VERIFY_TIMEOUT = 3000;

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

async function fetchFast(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(FAST_TIMEOUT),
      redirect: 'follow',
    });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}

async function headFast(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(VERIFY_TIMEOUT),
    });
    return res.ok;
  } catch { return false; }
}

function extractAll(text: string, open: string, close: string): string[] {
  const out: string[] = [];
  let idx = 0;
  while (true) {
    const s = text.indexOf(open, idx);
    if (s === -1) break;
    const e = text.indexOf(close, s + open.length);
    if (e === -1) break;
    out.push(text.substring(s + open.length, e));
    idx = e + close.length;
  }
  return out;
}

function between(text: string, before: string, after: string, start = 0): string | null {
  const s = text.indexOf(before, start);
  if (s === -1) return null;
  const e = text.indexOf(after, s + before.length);
  return e === -1 ? null : text.substring(s + before.length, e);
}

function isStreamUrl(u: string): boolean {
  const l = u.toLowerCase();
  return /\.(m3u8|mp4|webm|flv)/.test(l) || /(player|embed|stream|live|watch)/.test(l);
}

function extractEmbeds(html: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const f of extractAll(html, '<iframe', '</iframe>')) {
    const src = between(f, 'src="', '"') || between(f, "src='", "'");
    if (src && !seen.has(src)) { seen.add(src); found.push(src); }
  }
  for (const a of extractAll(html, '<a', '</a>')) {
    const href = between(a, 'href="', '"') || between(a, "href='", "'");
    const text = a.replace(/<[^>]*>/g, '').trim();
    if (href && !seen.has(href) && isStreamUrl(href + ' ' + text)) { seen.add(href); found.push(href); }
  }
  for (const s of extractAll(html, '<source', '>')) {
    const src = between(s, 'src="', '"') || between(s, "src='", "'");
    if (src && !seen.has(src)) { seen.add(src); found.push(src); }
  }
  return found;
}

function normalize(href: string, base: string): string | null {
  try {
    let t = href.trim();
    if (t.startsWith('//')) t = 'https:' + t;
    if (!t.startsWith('http')) return new URL(t, base).href;
    return t;
  } catch { return null; }
}

async function tryUrls(list: string[], base: string): Promise<string | null> {
  for (const u of list) {
    const full = normalize(u, base);
    if (!full) continue;
    const html = await fetchFast(full);
    if (!html) continue;
    const embeds = extractEmbeds(html);
    const stream = embeds.find(e => isStreamUrl(e));
    if (stream) {
      const resolved = normalize(stream, full);
      if (resolved) return resolved;
    }
  }
  return null;
}

function buildSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function buildFighterSlug(name: string): string | null {
  const m = name.toLowerCase().match(/(.+?)\s*vs\.?\s*(.+)/i);
  if (!m) return null;
  return `${m[1].trim().replace(/\s+/g, '-')}-vs-${m[2].trim().replace(/\s+/g, '-')}`;
}

export async function getCurrentEvent(): Promise<{ name: string; date: string } | null> {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const ev = data?.events?.[0];
      if (ev) return { name: ev.name || ev.shortName || '', date: ev.date?.split('T')[0] || '' };
    }
  } catch {}
  return null;
}

async function tryGuesses(site: { id: string; name: string; url: string }, eventName: string): Promise<StreamSource | null> {
  const host = new URL(site.url).origin;
  const slug = buildSlug(eventName);
  const fSlug = buildFighterSlug(eventName);
  const slugs = [slug, fSlug].filter(Boolean) as string[];

  for (const s of slugs) {
    const patterns = [
      `${host}/ufc-${s}/`,
      `${host}/${s}/`,
    ];
    const embed = await tryUrls(patterns, site.url);
    if (embed) {
      const verified = await headFast(embed);
      return { id: site.id, name: site.name, url: embed, verified };
    }
  }
  return null;
}

async function tryHomepage(site: { id: string; name: string; url: string }): Promise<StreamSource | null> {
  const html = await fetchFast(site.url);
  if (!html) return null;

  const embeds = extractEmbeds(html);
  const streams = embeds.filter(e => isStreamUrl(e));
  if (streams.length > 0) {
    const resolved = normalize(streams[0], site.url);
    if (resolved) {
      const verified = await headFast(resolved);
      return { id: site.id, name: site.name, url: resolved, verified };
    }
  }

  const links: string[] = [];
  for (const a of extractAll(html, '<a', '</a>')) {
    const href = between(a, 'href="', '"') || between(a, "href='", "'");
    const text = a.replace(/<[^>]*>/g, '').trim();
    if (href) {
      const full = normalize(href, site.url);
      if (full && !full.includes('javascript:')) {
        const both = href + ' ' + text;
        if (both.toLowerCase().includes('ufc') || /\bmma\b/i.test(both)) links.push(full);
        if (['schedule', 'events', 'live', 'today'].some(k => full.toLowerCase().includes(k))) links.push(full);
      }
    }
  }

  for (const url of links) {
    const page = await fetchFast(url);
    if (!page) continue;
    const pageEmbeds = extractEmbeds(page);
    const stream = pageEmbeds.find(e => isStreamUrl(e));
    if (stream) {
      const resolved = normalize(stream, url);
      if (resolved) {
        const verified = await headFast(resolved);
        return { id: site.id, name: site.name, url: resolved, verified };
      }
    }
  }

  return null;
}

export async function scrapeAllSites(saveToDb?: (sources: StreamSource[]) => Promise<void>): Promise<{
  sources: StreamSource[];
  eventInfo: { name: string; date: string } | null;
  logs: string[];
}> {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[STREAM]', m); logs.push(m); };

  const eventInfo = await getCurrentEvent();
  if (eventInfo) log(`Event: ${eventInfo.name}`);
  else log('No event info from ESPN');

  log(`Scraping ${SITES.length} sites...`);

  const allSources: StreamSource[] = [];

  for (let i = 0; i < SITES.length; i += 4) {
    const batch = SITES.slice(i, i + 4);
    const results = await Promise.allSettled(
      batch.map(s =>
        eventInfo
          ? tryGuesses(s, eventInfo.name).then(r => r || tryHomepage(s))
          : tryHomepage(s)
      )
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled' && r.value) {
        const s = { ...r.value, eventName: eventInfo?.name, eventDate: eventInfo?.date };
        allSources.push(s);
        log(`${batch[j].name}: ${s.url} (${s.verified ? 'ok' : '? '})`);
      } else {
        log(`${batch[j].name}: no embed`);
      }
    }
  }

  log(`Found: ${allSources.length}/${SITES.length}`);

  if (saveToDb && allSources.length > 0) {
    await saveToDb(allSources);
    log('Saved to DB');
  }

  return { sources: allSources, eventInfo, logs };
}
