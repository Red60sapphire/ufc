import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

function getUser(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function GET() {
  const streams = await query`
    SELECT s.*, u.username FROM streams s JOIN users u ON s.created_by = u.id ORDER BY s.is_live DESC, s.created_at DESC
  `;
  return NextResponse.json({ streams });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const user = getUser(cookieStore);
  if (!user?.is_admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { title, description, video_url, thumbnail_url, is_live } = await request.json();
    await query`
      INSERT INTO streams (title, description, video_url, thumbnail_url, is_live, created_by)
      VALUES (${title}, ${description || null}, ${video_url}, ${thumbnail_url || null}, ${is_live || 0}, ${user.id})
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create stream' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const user = getUser(cookieStore);
  if (!user?.is_admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, is_live } = await request.json();
    await query`UPDATE streams SET is_live = ${is_live} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update stream' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const user = getUser(cookieStore);
  if (!user?.is_admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    await query`DELETE FROM streams WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete stream' }, { status: 500 });
  }
}
