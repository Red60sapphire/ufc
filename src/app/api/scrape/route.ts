import { NextRequest, NextResponse } from 'next/server';
import { query, rawQueryOrThrow } from '@/lib/db';
import { scrapeAll } from '@/lib/replay-scraper';

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[SCRAPE-DEBUG]', m); logs.push(m); };

  try {
    // ========== BEFORE ==========
    log('=== BEFORE SCRAPE ===');
    const beforeRows: any[] = await rawQueryOrThrow('SELECT COUNT(*) as count FROM ufc_replays', []);
    const beforeCount = parseInt(beforeRows[0]?.count || '0');
    log(`DB count BEFORE scrape: ${beforeCount}`);

    const beforeSlugs: any[] = await rawQueryOrThrow('SELECT slug FROM ufc_replays ORDER BY slug', []);
    log(`Slugs BEFORE (all ${beforeSlugs.length}):`);
    beforeSlugs.forEach((r: any, i: number) => log(`  [${i}] ${r.slug}`));

    // Also check what the API would return
    const apiCheck: any[] = await rawQueryOrThrow('SELECT slug, title, created_at FROM ufc_replays WHERE published = 1 ORDER BY created_at DESC LIMIT 5', []);
    log(`API would return ${apiCheck.length} published replays`);

    // ========== SCRAPE ==========
    log('');
    log('=== RUNNING SCRAPE ===');
    const result = await scrapeAll(5);
    log(`Scrape result: ${JSON.stringify(result)}`);

    // ========== AFTER ==========
    log('');
    log('=== AFTER SCRAPE ===');
    const afterRows: any[] = await rawQueryOrThrow('SELECT COUNT(*) as count FROM ufc_replays', []);
    const afterCount = parseInt(afterRows[0]?.count || '0');
    log(`DB count AFTER scrape: ${afterCount}`);

    const afterSlugs: any[] = await rawQueryOrThrow('SELECT slug FROM ufc_replays ORDER BY slug', []);
    log(`Slugs AFTER (all ${afterSlugs.length}):`);
    afterSlugs.forEach((r: any, i: number) => log(`  [${i}] ${r.slug}`));

    // ========== COMPARE ==========
    log('');
    log('=== COMPARISON ===');
    log(`DB before: ${beforeCount}, DB after: ${afterCount}, Difference: ${afterCount - beforeCount}`);

    const beforeSet = new Set(beforeSlugs.map((r: any) => r.slug));
    const afterSet = new Set(afterSlugs.map((r: any) => r.slug));
    const newSlugs = afterSlugs.filter((r: any) => !beforeSet.has(r.slug));
    const removedSlugs = beforeSlugs.filter((r: any) => !afterSet.has(r.slug));

    log(`New slugs inserted: ${newSlugs.length}`);
    newSlugs.forEach((r: any) => log(`  NEW: ${r.slug}`));
    log(`Slugs removed: ${removedSlugs.length}`);
    removedSlugs.forEach((r: any) => log(`  REMOVED: ${r.slug}`));

    // ========== CHECK IF SCRAPER IS EVEN CALLED ==========
    log('');
    log('=== SCRAPER INTEGRITY ===');
    log(`scrapeAll function type: ${typeof scrapeAll}`);
    log(`scrapeAll returned: events=${result.events}, fights=${result.fights}, new=${result.newFights}, errors=${result.errors.length}`);

    return NextResponse.json({
      success: true,
      beforeCount,
      afterCount,
      inserted: afterCount - beforeCount,
      newSlugs: newSlugs.map((r: any) => r.slug),
      removedSlugs: removedSlugs.map((r: any) => r.slug),
      scrapeResult: result,
      logs,
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack?.substring(0, 1000),
      logs,
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  }
}
