import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['api.mmareplayfull.com', 'portal.portalmma.cc'];

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
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

  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,video/mp2t,video/mp4,*/*',
        'Referer': 'https://mmareplayfull.com/',
      },
    });

    if (!response.ok) {
      return new NextResponse(await response.text(), {
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

    if (contentType) {
      resHeaders['Content-Type'] = contentType;
    }

    if (isPlaylist) {
      let body = await response.text();
      // 1. Rewrite relative paths (except already-proxied URLs)
      body = body.replace(/^\/(?!api\/video-proxy)[^\s#]+/gm, (match) => {
        const fullUrl = `https://api.mmareplayfull.com${match}`;
        return `/api/video-proxy?url=${encodeURIComponent(fullUrl)}`;
      });
      // 2. Rewrite absolute URLs from allowed hosts
      body = body.replace(/^(https?:\/\/[^\s]+)/gm, (match) => {
        try {
          const u = new URL(match);
          if (ALLOWED_HOSTS.includes(u.hostname)) {
            return `/api/video-proxy?url=${encodeURIComponent(match)}`;
          }
        } catch {}
        return match;
      });
      return new NextResponse(body, { headers: resHeaders });
    }

    if (!response.body) {
      return new NextResponse(null, { headers: resHeaders });
    }

    return new NextResponse(response.body, {
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}
