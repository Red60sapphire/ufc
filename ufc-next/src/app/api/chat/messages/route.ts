import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stream_id = searchParams.get('stream_id');

  if (!stream_id) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await query`
    SELECT cm.*, u.username, u.is_admin
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.stream_id = ${parseInt(stream_id)}
    ORDER BY cm.created_at ASC
    LIMIT 100
  `;

  return NextResponse.json({ messages });
}
