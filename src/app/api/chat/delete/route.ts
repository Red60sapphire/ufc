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

  if (!user.is_admin) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const { action, message_id, stream_id } = await request.json();

    if (action === 'delete_one' && message_id) {
      await query`DELETE FROM chat_messages WHERE id = ${message_id}`;
    } else if (action === 'clear_stream' && stream_id) {
      await query`DELETE FROM chat_messages WHERE stream_id = ${stream_id}`;
    } else if (action === 'clear_all') {
      await query`DELETE FROM chat_messages`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
