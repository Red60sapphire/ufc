import { getRankingsWithAthletes } from "@/lib/ufc-data-fetcher";
import Link from "next/link";

export default async function FightersPage() {
  const rankings = await getRankingsWithAthletes();

  const p4p = rankings.filter(r => r.name.toLowerCase().includes('pound'));
  const divisions = rankings.filter(r => !r.name.toLowerCase().includes('pound') && r.ranks.length > 0);
  const allFighters = rankings.flatMap(g => g.ranks.map(r => ({ ...r, group: g.name })));

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-3">Roster</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">UFC Fighters</h1>
          <p className="text-gray-500 text-sm mt-2">Browse ranked fighters across all divisions</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-gray-600 text-xs">{allFighters.length} ranked fighters</span>
            <span className="text-gray-800">|</span>
            <span className="text-gray-600 text-xs">{divisions.length} weight classes</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {p4p.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white text-sm uppercase tracking-wider font-bold mb-5 flex items-center gap-2">
              <span className="text-lg">👑</span> Pound for Pound
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {p4p.flatMap(g => g.ranks.slice(0, 5)).map((entry: any) => (
                <FighterCard key={entry.athleteId} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {divisions.map((group) => (
          <section key={group.id} className="mb-12">
            <h2 className="text-white text-sm uppercase tracking-wider font-bold mb-5">{group.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {group.ranks.map((entry: any) => (
                <FighterCard key={entry.athleteId} entry={entry} />
              ))}
            </div>
          </section>
        ))}

        {rankings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Fighter data unavailable at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FighterCard({ entry }: { entry: any }) {
  return (
    <Link
      href={`/fighter/${entry.athleteId}`}
      className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 card-hover text-center"
    >
      <div className="relative w-16 h-16 mx-auto mb-3">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-md group-hover:blur-xl transition-all" />
        <div className="relative w-full h-full rounded-full bg-gray-800 overflow-hidden ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all">
          {entry.athlete?.image ? (
            <img src={entry.athlete.image} alt={entry.athlete.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">
              {entry.athlete?.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>
      <p className="text-white text-xs font-semibold group-hover:text-ufc-red transition-colors truncate">
        {entry.athlete?.name || `Fighter #${entry.athleteId}`}
      </p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className={`text-[10px] font-bold ${entry.rank <= 3 ? 'text-ufc-red' : 'text-gray-500'}`}>
          #{entry.rank}
        </span>
        {entry.athlete?.record && (
          <>
            <span className="text-gray-700">•</span>
            <span className="text-gray-500 text-[10px]">{entry.athlete.record}</span>
          </>
        )}
      </div>
      {entry.athlete?.country && (
        <span className="text-gray-600 text-[10px] mt-1 block">
          {entry.athlete.flag ? <img src={entry.athlete.flag} alt={entry.athlete.country} className="w-3.5 h-2.5 inline mr-1" /> : null}
          {entry.athlete.country}
        </span>
      )}
    </Link>
  );
}
