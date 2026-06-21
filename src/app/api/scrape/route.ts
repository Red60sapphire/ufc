import { NextResponse } from 'next/server';
import { scrapeAll } from '@/lib/replay-scraper';

export async function GET() {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[SCRAPE]', m); logs.push(m); };

  try {
    const maxPages = 15;
    log(`Starting fullfightreplays.com scrape (max ${maxPages} pages)...`);
    const result = await scrapeAll(maxPages);
    log(`Done: ${result.pagesScanned} pages, ${result.entriesFound} entries, ${result.newFights} new`);
    if (result.errors.length > 0) {
      log(`Errors (${result.errors.length}):`);
      result.errors.slice(0, 20).forEach(e => log(`  - ${e}`));
    }
    return NextResponse.json({ success: true, ...result, logs }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, logs }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
