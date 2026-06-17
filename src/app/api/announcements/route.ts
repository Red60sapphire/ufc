import { NextRequest, NextResponse } from 'next/server';
import { query, rawQueryOrThrow } from '@/lib/db';
import { cookies } from 'next/headers';

function getSessionUser(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')) as { id: number; username: string; is_admin: number };
  } catch {
    return null;
  }
}

export async function GET() {
  const announcements = await query`
    SELECT a.*, u.username FROM announcements a
    JOIN users u ON a.created_by = u.id
    WHERE a.is_active = 1
    ORDER BY a.created_at DESC
  `;
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = getSessionUser(cookieStore);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, message, duration_minutes, dismissible, persistent } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const expiresAt = duration_minutes
      ? new Date(Date.now() + duration_minutes * 60000).toISOString()
      : null;

    const result = await rawQueryOrThrow(
      `INSERT INTO announcements (title, message, created_by, expires_at, dismissible, persistent, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title || '', message, user.id, expiresAt, dismissible ? 1 : 0, persistent ? 1 : 0, duration_minutes || null]
    );

    return NextResponse.json({ success: true, announcement: result[0] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create announcement' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = getSessionUser(cookieStore);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, is_active } = await req.json();
    await rawQueryOrThrow(
      `UPDATE announcements SET is_active = $1 WHERE id = $2`,
      [is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = getSessionUser(cookieStore);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await req.json();
    await rawQueryOrThrow(`DELETE FROM announcements WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete announcement' }, { status: 500 });
  }
}
