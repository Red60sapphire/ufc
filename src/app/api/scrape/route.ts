import { NextRequest, NextResponse } from 'next/server';
import { query, rawQueryOrThrow } from '@/lib/db';

const BASE = 'https://mmareplayfull.com';
const API_BASE = 'https://api.mmareplayfull.com';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractNextData(html: string): any {
  const m = html.match(/__NEXT_DATA__.*?application\/json">(.*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(m[1]);
}

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[SCRAPE-DEBUG]', m); logs.push(m); };

  try {
    // Step 1: Get ALL available events
    log('=== STEP 1: FETCH ALL AVAILABLE EVENTS ===');
    const homepageRes = await fetch(BASE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await homepageRes.text();
    const data = extractNextData(html);
    const latestEvents: any[] = data?.props?.pageProps?.latestEvents || [];
    const avail = latestEvents.filter((e: any) => e.is_video_available);
    log(`Total events: ${latestEvents.length}, with video_available: ${avail.length}`);

    // Step 2: For each available event, fetch its page and count fights with clips
    log('');
    log('=== STEP 2: CHECK EACH EVENT FOR CLIPS ===');
    let eventsWithClips = 0;
    let totalClips = 0;
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

        const withClips = fights.filter((f: any) => f.clip && f.is_clip_available && f.participants?.length >= 2);
        if (withClips.length > 0) {
          eventsWithClips++;
          totalClips += withClips.length;
          log(`[CLIPS] ${event.name} (${event.date}): ${withClips.length}/${fights.length} fights have clips`);
        } else {
          log(`[NONE] ${event.name} (${event.date}): 0/${fights.length} fights have clips`);
        }

        if (eventsChecked >= 30) break;
      } catch (err: any) {
        log(`[ERR] ${event.name}: ${err.message}`);
      }
    }

    log('');
    log(`=== RESULT: ${eventsWithClips}/${eventsChecked} events have clips, ${totalClips} total clip fights found ===`);

    // Step 3: Show which events are already in DB
    log('');
    log('=== STEP 3: EXISTING DB EVENTS ===');
    const existingRows: any[] = await query`SELECT DISTINCT event_name FROM ufc_replays ORDER BY event_name`;
    log(`Events in DB (${existingRows.length}):`);
    existingRows.forEach((r: any) => log(`  ${r.event_name}`));

    return NextResponse.json({
      success: true,
      totalEvents: latestEvents.length,
      eventsWithVideo: avail.length,
      eventsChecked,
      eventsWithClips,
      totalClipFights: totalClips,
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
