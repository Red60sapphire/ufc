import { rawQueryOrThrow } from '@/lib/db';
import type { StreamSource } from '@/lib/stream-scraper';

const FALLBACK: StreamSource[] = [
  { id: 'soccerball', name: 'Soccer Ball', url: 'https://soccerball.st/rampages/unoairuf/', verified: true },
  { id: 'statusnode', name: 'StatusNode', url: 'https://statusnode.is/nodejs/?t=2', verified: true },
  { id: 'streamscenter', name: 'Streams Center', url: 'https://streams.center/embed/ch48.php', verified: true },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await rawQueryOrThrow(
      `SELECT source_id, name, url, verified, event_name, event_date, error
       FROM stream_sources ORDER BY verified DESC, created_at DESC`,
    );

    if (rows.length > 0) {
      const sources: StreamSource[] = rows.map((r: any) => ({
        id: r.source_id,
        name: r.name,
        url: r.url,
        verified: r.verified === 1 || r.verified === true,
        eventName: r.event_name,
        eventDate: r.event_date,
        error: r.error || undefined,
      }));
      return Response.json({ sources, source: 'database' });
    }
  } catch {}

  return Response.json({ sources: FALLBACK, source: 'fallback' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, name, url, eventName, eventDate } = body;

    if (!sourceId || !name || !url) {
      return Response.json({ error: 'Missing required fields: sourceId, name, url' }, { status: 400 });
    }

    await rawQueryOrThrow(
      `INSERT INTO stream_sources (source_id, name, url, verified, event_name, event_date)
       VALUES ($1,$2,$3,1,$4,$5)
       ON CONFLICT (source_id) DO UPDATE SET url=$3, verified=1, event_name=$4, event_date=$5, error=NULL, created_at=NOW()`,
      [sourceId, name, url, eventName || null, eventDate || null],
    );

    return Response.json({ success: true, source: { id: sourceId, name, url, verified: true, eventName, eventDate } });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
