import { NextRequest, NextResponse } from 'next/server';
import { query, rawQueryOrThrow } from '@/lib/db';

const BASE = 'https://mmareplayfull.com';
const API_BASE = 'https://api.mmareplayfull.com';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractNextData(html: string): any {
  const match = html.match(/__NEXT_DATA__.*?application\/json">(.*?)<\/script>/);
  if (!match) throw new Error('__NEXT_DATA__ not found');
  return JSON.parse(match[1]);
}

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (m: string) => { console.log('[SCRAPE-DEBUG]', m); logs.push(m); };

  try {
    // Step 1: fetch homepage
    log('Step 1: Fetching homepage...');
    const homepageRes = await fetch(BASE, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await homepageRes.text();
    log(`Homepage HTML size: ${html.length} bytes`);

    // Step 2: extract __NEXT_DATA__
    log('Step 2: Extracting __NEXT_DATA__...');
    const data = extractNextData(html);
    const latestEvents: any[] = data?.props?.pageProps?.latestEvents || [];
    log(`latestEvents is array: ${Array.isArray(latestEvents)}`);
    log(`latestEvents length: ${latestEvents.length}`);

    // Count available events
    const available = latestEvents.filter((e: any) => e.is_video_available === true);
    log(`Events with is_video_available=true: ${available.length}`);

    // Print first 5 and last 5 event names/dates
    log('First 5 events:');
    for (let i = 0; i < Math.min(5, latestEvents.length); i++) {
      const e = latestEvents[i];
      log(`  [${i}] ${e.name} | ${e.date} | video_available=${e.is_video_available} | id=${e.id}`);
    }
    log('Last 5 events:');
    for (let i = Math.max(0, latestEvents.length - 5); i < latestEvents.length; i++) {
      const e = latestEvents[i];
      log(`  [${i}] ${e.name} | ${e.date} | video_available=${e.is_video_available} | id=${e.id}`);
    }

    // Step 3: check DB existing events
    log('Step 3: Checking DB for existing events...');
    const existingRows: any[] = await query`SELECT DISTINCT event_name, event_date FROM ufc_replays`;
    log(`Existing events in DB: ${existingRows.length}`);
    
    // Step 4: pick the first available event that's NOT in DB to test
    log('Step 4: Finding first new event to inspect...');
    const existingSet = new Set(existingRows.map((r: any) => {
      const d = typeof r.event_date === 'string' ? r.event_date.substring(0, 10) : new Date(r.event_date).toISOString().substring(0, 10);
      return `${r.event_name}|${d}`;
    }));
    
    let firstNewEvent: any = null;
    for (const e of available) {
      const key = `${e.name}|${e.date.substring(0, 10)}`;
      if (!existingSet.has(key)) {
        firstNewEvent = e;
        break;
      }
    }
    
    if (firstNewEvent) {
      log(`First new event: ${firstNewEvent.name} | ${firstNewEvent.date} | id=${firstNewEvent.id}`);

      // Step 5: fetch the event page
      const eventSlug = `${firstNewEvent.date}-${slugify(firstNewEvent.name)}-${firstNewEvent.id}`;
      const eventUrl = `${BASE}/events/${eventSlug}`;
      log(`Step 5: Fetching event page: ${eventUrl}`);
      
      const eventRes = await fetch(eventUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      const eventHtml = await eventRes.text();
      log(`Event page HTML size: ${eventHtml.length} bytes`);
      
      const eventData = extractNextData(eventHtml);
      const fights: any[] = eventData?.props?.pageProps?.fights || [];
      log(`Total fights in event: ${fights.length}`);
      
      // Print fight details
      for (let i = 0; i < Math.min(50, fights.length); i++) {
        const f = fights[i];
        const p1 = f.participants?.[0]?.display_name || '?';
        const p2 = f.participants?.[1]?.display_name || '?';
        const hasClip = !!f.clip;
        const clipAvail = f.is_clip_available;
        const clipUrl = f.clip ? `${API_BASE}${f.clip.playlist_url}` : 'N/A';
        log(`  Fight [${i}]: ${p1} vs ${p2} | has_clip=${hasClip} | is_clip_available=${clipAvail} | clip_url=${clipUrl}`);
      }
    } else {
      log('No new events found - all events already in DB!');
    }

    // Step 6: Check total replay count in DB
    const countRes = await query`SELECT COUNT(*) as count FROM ufc_replays`;
    log(`Step 6: Total replays in DB: ${countRes[0]?.count || 0}`);

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, logs: logs.concat([`ERROR: ${err.message} ${err.stack || ''}`]) });
  }
}
