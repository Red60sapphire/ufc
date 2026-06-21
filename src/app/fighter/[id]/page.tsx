import { getAthlete } from "@/lib/ufc-data-fetcher";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function FighterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const athlete = await getAthlete(id);
  if (!athlete) notFound();

  const replays = await query`
    SELECT * FROM ufc_replays 
    WHERE (fighter1 ILIKE ${'%' + athlete.name.split(' ')[0] + '%'} OR fighter2 ILIKE ${'%' + athlete.name.split(' ')[0] + '%'})
    ORDER BY event_date DESC NULLS LAST
    LIMIT 20
  `;

  const headshotId = id;
  const imgUrl = athlete.image;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.05),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/30 to-transparent blur-2xl" />
              <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 ring-1 ring-white/10 shadow-2xl">
                {imgUrl ? (
                  <img src={imgUrl} alt={athlete.name} className="w-full h-full object-cover scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-5xl">
                    {athlete.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full border border-gray-700 whitespace-nowrap">
                {athlete.record || 'N/A'}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">{athlete.name}</h1>
              {athlete.nickname && (
                <p className="text-ufc-gold text-sm md:text-base mt-1">&ldquo;{athlete.nickname}&rdquo;</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                {athlete.weightClass && (
                  <span className="bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border border-ufc-red/20">
                    {athlete.weightClass}
                  </span>
                )}
                {athlete.country && (
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    {athlete.flag ? <img src={athlete.flag} alt="" className="w-4 h-3" /> : null}
                    {athlete.country}
                  </span>
                )}
                {athlete.age && (
                  <span className="text-gray-500 text-xs">{athlete.age} years old</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6">
                <Link
                  href={`/head-to-head?fighter=${encodeURIComponent(athlete.name)}`}
                  className="bg-ufc-red text-white px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                >
                  Compare Fighter
                </Link>
                <Link
                  href={`/replays?search=${encodeURIComponent(athlete.name.split(' ')[0])}`}
                  className="border border-gray-600 text-gray-300 px-5 py-2 text-xs uppercase tracking-wider rounded-full hover:bg-white/5 hover:border-gray-500 transition"
                >
                  View Fights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Height', value: athlete.height },
            { label: 'Weight', value: athlete.weight },
            { label: 'Reach', value: athlete.reach },
            { label: 'Stance', value: athlete.stance },
            { label: 'Record', value: athlete.record },
            { label: 'Age', value: athlete.age ? `${athlete.age}` : null },
          ].filter(s => s.value).map(s => (
            <div key={s.label} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 text-center card-hover">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">{s.label}</p>
              <p className="text-white text-base font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {replays.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
              <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Fight History</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
            </div>
            <div className="space-y-2">
              {replays.map((fight: any) => (
                <Link
                  key={fight.id}
                  href={`/replays/${fight.slug || fight.id}`}
                  className="flex items-center gap-4 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 card-hover group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-gray-700 flex-shrink-0">
                      {fight.fighter1_img ? (
                        <img src={fight.fighter1_img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{fight.fighter1?.charAt(0)}</div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold truncate ${fight.fighter1?.toLowerCase().includes(athlete.name.split(' ')[0].toLowerCase()) ? 'text-ufc-red' : 'text-white'}`}>
                      {fight.fighter1}
                    </span>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <span className="text-ufc-red text-[10px] font-black block">VS</span>
                    <span className="text-gray-600 text-[8px] uppercase">{fight.weight_class || ''}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className={`text-xs font-semibold truncate ${fight.fighter2?.toLowerCase().includes(athlete.name.split(' ')[0].toLowerCase()) ? 'text-ufc-red' : 'text-white'}`}>
                      {fight.fighter2}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-1 ring-gray-700 flex-shrink-0">
                      {fight.fighter2_img ? (
                        <img src={fight.fighter2_img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{fight.fighter2?.charAt(0)}</div>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block text-right flex-shrink-0 ml-4">
                    <p className="text-gray-400 text-[10px] font-medium">{fight.result || ''}</p>
                    <p className="text-gray-600 text-[10px]">{fight.event_date ? new Date(fight.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {replays.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No fight replays found for {athlete.name}.</p>
            <p className="text-gray-600 text-xs mt-1">Replays will appear here as they are added.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/head-to-head?fighter=${encodeURIComponent(athlete.name)}`}
            className="inline-flex items-center gap-2 text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-300 transition group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Compare {athlete.name.split(' ')[0]} with another fighter
          </Link>
        </div>
      </div>
    </div>
  );
}
