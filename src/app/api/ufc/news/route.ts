import { NextRequest, NextResponse } from 'next/server';
import { getNewsWithFallback } from '@/lib/ufc-data-fetcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const news = await getNewsWithFallback(limit);
  return NextResponse.json({ success: true, data: news, timestamp: new Date().toISOString(), source: 'espn' });
}
