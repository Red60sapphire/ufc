import { scrapeAllSites } from '@/lib/stream-scraper';
import { rawQueryOrThrow } from '@/lib/db';
import type { StreamSource } from '@/lib/stream-scraper';

export const maxDuration = 60;
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

  const result = await scrapeAllSites();
  const sources = result.sources.map(s => ({ ...s, eventName: result.eventInfo?.name, eventDate: result.eventInfo?.date }));

  return Response.json({ sources, source: 'live' });
}
