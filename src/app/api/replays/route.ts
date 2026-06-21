import { NextRequest, NextResponse } from 'next/server';
import { query, rawQueryOrThrow } from '@/lib/db';
import { cookies } from 'next/headers';
import { scrapeAll } from '@/lib/replay-scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');
  const search = searchParams.get('search');
  const promotion = searchParams.get('promotion');
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured');
  const admin = searchParams.get('admin');
  const limit = parseInt(searchParams.get('limit') || '200');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (id) {
    const replays = await query`SELECT * FROM ufc_replays WHERE id = ${parseInt(id)}`;
    if (replays.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ replay: replays[0] });
  }

  if (slug) {
    const replays = await query`SELECT * FROM ufc_replays WHERE slug = ${slug}`;
    if (replays.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ replay: replays[0] });
  }

  try {
    const forceScrape = searchParams.get('force') === '1';
    const countRows = await query`SELECT COUNT(*) as count FROM ufc_replays`;
    const currentCount = countRows.length > 0 ? parseInt(countRows[0]?.count || '0') : 0;

    if (forceScrape) {
      console.log('[API] Force scrape requested (current:', currentCount, ')...');
      const scrapeResult = await scrapeAll(30);
      console.log('[API] Force scrape done:', scrapeResult.newFights, 'new,', scrapeResult.errors.length, 'errors');
    }

    console.log('[API] Current replay count:', currentCount);

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (!admin) {
      conditions.push('published = 1');
      conditions.push("(source IS NULL OR source != 'mmareplayfull')");
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${idx} OR fighter1 ILIKE $${idx} OR fighter2 ILIKE $${idx} OR event_name ILIKE $${idx} OR promotion ILIKE $${idx})`);
      idx++;
    }
    if (promotion) {
      params.push(promotion);
      conditions.push(`promotion = $${idx}`);
      idx++;
    }
    if (featured === '1') {
      conditions.push('featured = 1');
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderBy = 'ORDER BY created_at DESC';
    if (sort === 'oldest') orderBy = 'ORDER BY created_at ASC';
    else if (sort === 'views') orderBy = 'ORDER BY views DESC';
    else if (sort === 'event_date') orderBy = 'ORDER BY event_date DESC NULLS LAST';

    let replays: any[] = [];
    let total = 0;
    try {
      replays = await rawQueryOrThrow(
        `SELECT * FROM ufc_replays ${where} ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
        params
      );
      const countResult = await rawQueryOrThrow(
        `SELECT COUNT(*) as count FROM ufc_replays ${where}`,
        params
      );
      total = countResult[0]?.count || 0;
    } catch {}

    return NextResponse.json({ replays, total });
  } catch (err) {
    return NextResponse.json({ replays: [], total: 0 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  let user: { id: number; username: string; is_admin: number };
  try { user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')); }
  catch { return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 }); }
  if (!user.is_admin) return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

  try {
    const body = await request.json();
    const { title, slug, promotion, event_name, fighter1, fighter2, weight_class, result, duration, description, thumbnail, video_url, event_date, featured, published } = body;

    if (!title || !slug || !video_url || !fighter1 || !fighter2) {
      return NextResponse.json({ success: false, error: 'Title, slug, video URL, and fighter names are required' }, { status: 400 });
    }

    await query`
      INSERT INTO ufc_replays (title, slug, promotion, event_name, fighter1, fighter2, weight_class, result, duration, description, thumbnail, video_url, event_date, featured, published)
      VALUES (${title}, ${slug}, ${promotion || 'UFC'}, ${event_name || null}, ${fighter1}, ${fighter2}, ${weight_class || null}, ${result || null}, ${duration || null}, ${description || null}, ${thumbnail || null}, ${video_url}, ${event_date || null}, ${featured ? 1 : 0}, ${published !== undefined ? (published ? 1 : 0) : 1})
    `;

    return NextResponse.json({ success: true, message: 'Replay created' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  let user: { id: number; username: string; is_admin: number };
  try { user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')); }
  catch { return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 }); }
  if (!user.is_admin) return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

  try {
    const body = await request.json();
    const { id, title, slug, promotion, event_name, fighter1, fighter2, weight_class, result, duration, description, thumbnail, video_url, event_date, featured, published } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Replay ID is required' }, { status: 400 });

    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const add = (name: string, val: any) => {
      if (val !== undefined) { sets.push(`${name} = $${idx++}`); params.push(val); }
    };
    add('title', title); add('slug', slug); add('promotion', promotion);
    add('event_name', event_name); add('fighter1', fighter1); add('fighter2', fighter2);
    add('weight_class', weight_class); add('result', result); add('duration', duration);
    add('description', description); add('thumbnail', thumbnail); add('video_url', video_url);
    add('event_date', event_date);
    if (featured !== undefined) add('featured', featured ? 1 : 0);
    if (published !== undefined) add('published', published ? 1 : 0);
    add('updated_at', new Date().toISOString());

    if (sets.length === 0) return NextResponse.json({ success: false, error: 'No fields' }, { status: 400 });

    params.push(id);
    await rawQueryOrThrow(`UPDATE ufc_replays SET ${sets.join(', ')} WHERE id = $${idx}`, params);

    return NextResponse.json({ success: true, message: 'Replay updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  let user: { id: number; username: string; is_admin: number };
  try { user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')); }
  catch { return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 }); }
  if (!user.is_admin) return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Replay ID is required' }, { status: 400 });
    await query`DELETE FROM ufc_replays WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'Replay deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
