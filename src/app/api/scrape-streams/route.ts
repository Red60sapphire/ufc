import { scrapeAllSites } from '@/lib/stream-scraper';
import { rawQueryOrThrow } from '@/lib/db';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  let savedCount = 0;
  let errors: string[] = [];

  const result = await scrapeAllSites(async (sources) => {
    for (const s of sources) {
      try {
        await rawQueryOrThrow(
          `INSERT INTO stream_sources (source_id, name, url, verified, event_name, event_date, error)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (source_id) DO UPDATE SET url=$3, verified=$4, event_name=$5, event_date=$6, error=$7, created_at=NOW()`,
          [s.id, s.name, s.url, s.verified ? 1 : 0, s.eventName || null, s.eventDate || null, s.error || null],
        );
        savedCount++;
      } catch (e: any) {
        errors.push(`${s.id}: ${e.message}`);
      }
    }
  });

  return Response.json({
    success: true,
    sourcesFound: result.sources.length,
    saved: savedCount,
    event: result.eventInfo,
    errors,
    logs: result.logs,
  });
}
