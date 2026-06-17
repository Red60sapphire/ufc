import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ success: false, error: 'Not logged in' }, { status: 401 });
  }

  let user: { id: number; username: string; is_admin: number };
  try {
    user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { stream_id, message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ success: false, error: 'Message too long (max 500 chars)' }, { status: 400 });
    }

    const streams = await query`SELECT id FROM streams WHERE id = ${stream_id}`;
    if (streams.length === 0) {
      return NextResponse.json({ success: false, error: 'Stream not found' }, { status: 404 });
    }

    await query`
      INSERT INTO chat_messages (stream_id, user_id, message)
      VALUES (${stream_id}, ${user.id}, ${message.trim()})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
