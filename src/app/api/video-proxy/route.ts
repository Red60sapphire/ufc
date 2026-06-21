import { NextRequest, NextResponse } from 'next/server';

const MAX_RETRIES = 2;
const FETCH_TIMEOUT = 15000;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (err: any) {
      console.error(`[video-proxy] Attempt ${attempt + 1}/${retries + 1} failed:`, err?.message || err);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Unreachable');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Headers': '*' },
  });
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (targetUrl.hostname.includes('mmareplayfull.com')) {
    console.warn(`[video-proxy] Blocked dead domain: ${targetUrl.hostname}`);
    return NextResponse.json({ error: 'Source unavailable', detail: 'MMAReplayFull is no longer available. Run /api/scrape to fetch fresh replays from fullfightreplays.com.' }, { status: 410 });
  }

  try {
    console.log(`[video-proxy] Fetching: ${targetUrl.toString()}`);
    const response = await fetchWithRetry(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,video/mp2t,video/mp4,*/*',
      },
    });

    if (!response.ok) {
      console.warn(`[video-proxy] Upstream ${response.status} for ${targetUrl.toString()}`);
      const body = await response.text().catch(() => '');
      return new NextResponse(body || response.statusText, {
        status: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Headers': '*' },
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const isPlaylist = contentType.includes('mpegurl') || contentType.includes('m3u8');

    const resHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'public, max-age=60',
    };
    if (contentType) resHeaders['Content-Type'] = contentType;

    if (isPlaylist) {
      let body = await response.text();
      body = body.split('\n').map((line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === '') return line;
        try {
          const resolved = new URL(trimmed, targetUrl).toString();
          return `/api/video-proxy?url=${encodeURIComponent(resolved)}`;
        } catch {}
        return line;
      }).join('\n');
      return new NextResponse(body, { headers: resHeaders });
    }

    if (!response.body) {
      return new NextResponse(null, { headers: resHeaders });
    }

    return new NextResponse(response.body, { headers: resHeaders });
  } catch (err: any) {
    console.error(`[video-proxy] Fatal error for ${targetUrl?.toString() || urlParam}:`, err?.message || err);
    return NextResponse.json({ error: `Proxy failed: ${err?.message || 'Unknown'}` }, { status: 502 });
  }
}
