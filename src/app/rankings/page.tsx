import { getRankingsWithAthletes } from "@/lib/ufc-data-fetcher";
import Link from "next/link";

const tabEmojis: Record<string, string> = {
  "Men's Pound for Pound Rankings": "👑",
  "Women's Pound for Pound Rankings": "👑",
};

const weightClassIcons: Record<string, string> = {
  heavyweight: "🏆",
  "light-heavyweight": "🏆",
  middleweight: "🏆",
  welterweight: "🏆",
  lightweight: "🏆",
  featherweight: "🏆",
  bantamweight: "🏆",
  flyweight: "🏆",
};

const trendColors: Record<string, string> = {
  '+': 'text-green-400',
  '-': 'text-gray-500',
  'up': 'text-green-400',
  'down': 'text-red-400',
};

const trendIcons: Record<string, string> = {
  '+': '▲',
  '-': '—',
  'up': '▲',
  'down': '▼',
};

export default async function RankingsPage() {
  const rankings = await getRankingsWithAthletes();

  const p4p = rankings.filter(r => r.name.toLowerCase().includes('pound'));
  const divisions = rankings.filter(r => !r.name.toLowerCase().includes('pound') && r.ranks.length > 0);

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <svg className="w-6 h-6 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4.5a1 1 0 112 0V7h2.5a1 1 0 110 2H11v2.5a1 1 0 11-2 0V9H6.5a1 1 0 010-2H9V4.5z" clipRule="evenodd" />
            </svg>
            <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">UFC Rankings</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Official pound-for-pound and division rankings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {p4p.length > 0 && (
          <section>
            <h2 className="text-white text-sm uppercase tracking-wider font-bold mb-5 flex items-center gap-2">
              <span className="text-lg">👑</span> Pound for Pound
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {p4p.map((group) => (
                <RankingGroup key={group.id} group={group} />
              ))}
            </div>
          </section>
        )}

        {divisions.length > 0 && (
          <section>
            <h2 className="text-white text-sm uppercase tracking-wider font-bold mb-5">By Division</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions.map((group) => (
                <RankingGroup key={group.id} group={group} />
              ))}
            </div>
          </section>
        )}

        {rankings.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4.5a1 1 0 112 0V7h2.5a1 1 0 110 2H11v2.5a1 1 0 11-2 0V9H6.5a1 1 0 010-2H9V4.5z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 text-sm">Rankings unavailable at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RankingGroup({ group }: { group: any }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-3 border-b border-gray-800/50">
        <h3 className="text-white text-xs uppercase tracking-wider font-bold">{group.name}</h3>
      </div>
      <div className="divide-y divide-gray-800/50">
        {group.ranks.map((entry: any) => (
          <div key={entry.rank} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
            <span className={`w-6 text-center text-sm font-bold ${entry.rank <= 3 ? 'text-ufc-red' : 'text-gray-500'}`}>
              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
            </span>
            <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-1 ring-gray-700">
              {entry.athlete?.image ? (
                <img src={entry.athlete.image} alt={entry.athlete.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                  ?
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-semibold truncate">{entry.athlete?.name || `Fighter #${entry.athleteId}`}</span>
                {entry.trend && entry.trend !== '-' && (
                  <span className={`text-[9px] ${trendColors[entry.trend] || 'text-gray-500'}`}>
                    {trendIcons[entry.trend] || entry.trend}
                  </span>
                )}
              </div>
              <span className="text-gray-500 text-[10px]">{entry.athlete?.record || ''} {entry.athlete?.weightClass ? `• ${entry.athlete.weightClass}` : ''}</span>
            </div>
            {entry.athlete?.country && (
              <span className="text-gray-600 text-xs flex-shrink-0" title={entry.athlete.country}>
                {entry.athlete.flag ? (
                  <img src={entry.athlete.flag} alt={entry.athlete.country} className="w-4 h-3 inline" />
                ) : entry.athlete.country.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
