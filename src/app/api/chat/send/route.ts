import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { stream_id, message, guest_name } = await request.json();

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

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (sessionCookie?.value) {
      let user: { id: number; username: string; is_admin: number };
      try {
        user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
      }
      await query`
        INSERT INTO chat_messages (stream_id, user_id, message)
        VALUES (${stream_id}, ${user.id}, ${message.trim()})
      `;
    } else if (guest_name && guest_name.trim()) {
      const name = guest_name.trim().slice(0, 30);
      await query`
        INSERT INTO chat_messages (stream_id, guest_name, message)
        VALUES (${stream_id}, ${name}, ${message.trim()})
      `;
    } else {
      return NextResponse.json({ success: false, error: 'Sign in or provide a guest name' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
