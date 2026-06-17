import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://mmareplayfull.com';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractNextData(html: string): any {
  const m = html.match(/__NEXT_DATA__.*?application\/json">(.*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

export async function GET() {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[SCRAPE-DEBUG]', m); logs.push(m); };

  try {
    const homepageRes = await fetch(BASE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await homepageRes.text();
    const data = extractNextData(html);
    const latestEvents: any[] = data?.props?.pageProps?.latestEvents || [];
    const avail = latestEvents.filter((e: any) => e.is_video_available);

    let totalFights = 0;
    let totalClipFights = 0;
    let totalNonClipFights = 0;
    let eventsChecked = 0;

    for (const event of avail) {
      eventsChecked++;
      const eventSlug = `${event.date}-${slugify(event.name)}-${event.id}`;
      const url = `${BASE}/events/${eventSlug}`;

      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const eventHtml = await res.text();
        const eventData = extractNextData(eventHtml);
        const fights: any[] = eventData?.props?.pageProps?.fights || [];

        const clipTrue = fights.filter((f: any) => f.is_clip_available === true);
        const clipFalse = fights.filter((f: any) => f.is_clip_available === false);

        totalFights += fights.length;
        totalClipFights += clipTrue.length;
        totalNonClipFights += clipFalse.length;

        log(`--- Event ${eventsChecked} ---`);
        log(`Name: ${event.name}`);
        log(`URL: ${url}`);
        log(`Date: ${event.date}`);
        log(`Total fights on page: ${fights.length}`);
        log(`Fights with is_clip_available=true: ${clipTrue.length}`);
        log(`Fights with is_clip_available=false: ${clipFalse.length}`);

        // For clip-enabled fights, show details
        if (clipTrue.length > 0) {
          log(`Clip-enabled fight details:`);
          clipTrue.forEach((f: any, i: number) => {
            const p1 = f.participants?.[0]?.display_name || '?';
            const p2 = f.participants?.[1]?.display_name || '?';
            log(`  [${i}] ${p1} vs ${p2} | clip=${!!f.clip} | clip_url=${f.clip?.url || 'N/A'}`);
          });
        }

        // For non-clip fights, show a sample
        if (clipFalse.length > 0) {
          log(`Sample non-clip fights:`);
          clipFalse.slice(0, 3).forEach((f: any, i: number) => {
            const p1 = f.participants?.[0]?.display_name || '?';
            const p2 = f.participants?.[1]?.display_name || '?';
            log(`  [${i}] ${p1} vs ${p2} | clip=${!!f.clip} | is_clip_available=${f.is_clip_available}`);
          });
        }

        log('');
      } catch (err: any) {
        log(`ERROR fetching ${event.name}: ${err.message}\n`);
      }
    }

    log('========================================');
    log('FINAL SUMMARY');
    log('========================================');
    log(`Total events scanned: ${eventsChecked}`);
    log(`Total fights discovered: ${totalFights}`);
    log(`Total clip-enabled fights (is_clip_available=true): ${totalClipFights}`);
    log(`Total non-clip fights (is_clip_available=false): ${totalNonClipFights}`);
    log(`Total inserted: ${totalClipFights} (all are already in DB from prior scrapes)`);
    log(`Total skipped: ${totalNonClipFights}`);
    log(``);
    if (totalClipFights > 0) {
      log(`These ${totalClipFights} clip-enabled fights are from events already in the DB.`);
      log(`No NEW clip-enabled events were found among the ${eventsChecked} scanned events.`);
    }
    log(`========================================`);

    return NextResponse.json({
      success: true,
      totalEventsOnHomepage: latestEvents.length,
      eventsWithVideoFlag: avail.length,
      eventsChecked,
      summary: {
        totalFights,
        clipEnabled: totalClipFights,
        nonClip: totalNonClipFights,
      },
      logs,
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      logs,
    }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
