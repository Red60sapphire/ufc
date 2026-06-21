import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let user: { id: number; username: string; is_admin: number };
  try {
    user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  if (!user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const users = await query`SELECT COUNT(*) as count FROM users`;
  const streams = await query`SELECT COUNT(*) as count FROM streams`;
  const liveStreams = await query`SELECT COUNT(*) as count FROM streams WHERE is_live = 1`;
  const messages = await query`SELECT COUNT(*) as count FROM chat_messages`;
  const recentUsers = await query`SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT 10`;
  const recentMessages = await query`
    SELECT cm.id, cm.message, cm.created_at, COALESCE(u.username, cm.guest_name) as username
    FROM chat_messages cm
    LEFT JOIN users u ON cm.user_id = u.id
    ORDER BY cm.created_at DESC LIMIT 20
  `;

  return NextResponse.json({
    stats: {
      users: users[0]?.count || 0,
      streams: streams[0]?.count || 0,
      liveStreams: liveStreams[0]?.count || 0,
      messages: messages[0]?.count || 0,
    },
    recentUsers,
    recentMessages,
  });
}
