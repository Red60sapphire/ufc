import { NextRequest, NextResponse } from 'next/server';
import { getAthlete, getRankings } from '@/lib/ufc-data-fetcher';

const CORE_BASE = 'https://sports.core.api.espn.com/v2/sports/mma';
const CACHE_TTL = 600;

let cache: { data: any; timestamp: number } | null = null;

async function getAllRankedAthletes() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL * 1000) return cache.data;

  const groups = await getRankings();
  const seen = new Set<string>();
  const athletes: any[] = [];

  for (const group of groups) {
    for (const entry of group.ranks) {
      if (!entry.athleteId || seen.has(entry.athleteId)) continue;
      seen.add(entry.athleteId);
      const athlete = await getAthlete(entry.athleteId);
      if (athlete) {
        athletes.push({ ...athlete, rank: entry.rank, rankingGroup: group.name });
      }
    }
  }

  cache = { data: athletes, timestamp: Date.now() };
  return athletes;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const id = searchParams.get('id');
  const division = searchParams.get('division');

  if (id) {
    const athlete = await getAthlete(id);
    return NextResponse.json({ success: true, data: athlete });
  }

  const athletes = await getAllRankedAthletes();

  let filtered = athletes;

  if (search) {
    filtered = athletes.filter((a: any) =>
      a.name.toLowerCase().includes(search)
    );
  }

  if (division) {
    filtered = filtered.filter((a: any) =>
      a.weightClass?.toLowerCase().includes(division.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}
