import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const replays = await query`SELECT * FROM ufc_replays WHERE id = ${parseInt(id)}`;
    if (replays.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ replay: replays[0] });
  }

  const replays = await query`SELECT * FROM ufc_replays ORDER BY created_at DESC`;
  return NextResponse.json({ replays });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let user: { id: number; username: string; is_admin: number };
  try {
    user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  if (!user.is_admin) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const { fighter1, fighter2, fighter1_img, fighter2_img, event, video_url } = await request.json();

    if (!fighter1 || !fighter2 || !video_url) {
      return NextResponse.json({ success: false, error: 'Fighter names and video URL are required' }, { status: 400 });
    }

    await query`
      INSERT INTO ufc_replays (fighter1, fighter2, fighter1_img, fighter2_img, event, video_url)
      VALUES (${fighter1}, ${fighter2}, ${fighter1_img || null}, ${fighter2_img || null}, ${event || null}, ${video_url})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let user: { id: number; username: string; is_admin: number };
  try {
    user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  if (!user.is_admin) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Replay ID is required' }, { status: 400 });
    }
    await query`DELETE FROM ufc_replays WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
