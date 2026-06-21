import { NextRequest, NextResponse } from 'next/server';
import { getEventsWithFightCards } from '@/lib/ufc-data-fetcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '6');
  const events = await getEventsWithFightCards(limit);
  return NextResponse.json({ success: true, data: events, timestamp: new Date().toISOString(), source: 'espn' });
}
