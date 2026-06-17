import { getUpcomingEvents, getFightCard } from "@/lib/ufc-data-fetcher";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await getUpcomingEvents(12);
  const eventRaw = events.find((e: any) => e.id === id);

  if (!eventRaw) notFound();

  const fightCard = await getFightCard(id);
  const event = {
    ...eventRaw,
    main: fightCard.main || [],
    prelims: fightCard.prelims || [],
    early: fightCard.early || [],
  };

  const allFights = [...(event.early || []), ...(event.prelims || []), ...(event.main || [])];
  const eventDate = new Date(event.date);

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.05),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-4">UFC Event</span>
          <h1 className="text-white text-2xl md:text-4xl font-bold uppercase tracking-tight">{event.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {event.venue && (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {event.venue}
                </span>
              </>
            )}
            {event.broadcast && (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-ufc-gold text-xs font-semibold uppercase tracking-wider">{event.broadcast}</span>
              </>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-2">{allFights.length} fights scheduled</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
        {event.fighter1 && event.fighter2 && (
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold text-center mb-4">Main Event</p>
            <div className="flex items-center justify-center gap-6 md:gap-12">
              <div className="text-center flex-1 max-w-[200px] group">
                <Link href={`/fighter/${(event as any).fights?.find((f: any) => f.fighter1 === event.fighter1)?.fighter1Id || ''}`} className="block">
                  <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 group-hover:border-ufc-red/30 transition-all">
                      {event.fighter1Img ? (
                        <img src={event.fighter1Img} alt={event.fighter1} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">{event.fighter1?.charAt(0)}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-white text-sm font-bold mt-3 group-hover:text-ufc-red transition-colors">{event.fighter1}</p>
                  <p className="text-gray-500 text-[10px]">{event.fighter1Record}</p>
                </Link>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#1a0000] border-2 border-ufc-red/20 flex items-center justify-center animate-ring-pulse">
                  <span className="text-ufc-red text-xl md:text-3xl font-black">VS</span>
                </div>
                {event.weightClass && (
                  <p className="text-ufc-gold text-[8px] md:text-xs uppercase tracking-wider mt-2 opacity-70">{event.weightClass}</p>
                )}
              </div>
              <div className="text-center flex-1 max-w-[200px] group">
                <Link href={`/fighter/${(event as any).fights?.find((f: any) => f.fighter2 === event.fighter2)?.fighter2Id || ''}`} className="block">
                  <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 group-hover:border-ufc-red/30 transition-all">
                      {event.fighter2Img ? (
                        <img src={event.fighter2Img} alt={event.fighter2} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">{event.fighter2?.charAt(0)}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-white text-sm font-bold mt-3 group-hover:text-ufc-red transition-colors">{event.fighter2}</p>
                  <p className="text-gray-500 text-[10px]">{event.fighter2Record}</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {event.main.length > 0 && (
          <FightCardSection title="Main Card" fights={event.main} />
        )}
        {event.prelims.length > 0 && (
          <FightCardSection title="Prelims" fights={event.prelims} />
        )}
        {event.early.length > 0 && (
          <FightCardSection title="Early Prelims" fights={event.early} />
        )}

        {allFights.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Fight card details not yet available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FightCardSection({ title, fights }: { title: string; fights: any[] }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-ufc-red rounded-full" />
          <h2 className="text-white text-xs uppercase tracking-wider font-bold">{title}</h2>
          <span className="text-gray-500 text-[10px] ml-auto">{fights.length} fights</span>
        </div>
      </div>
      <div className="divide-y divide-gray-800/50">
        {fights.map((fight: any, i: number) => (
          <div key={fight.id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                href={fight.fighter1Id ? `/fighter/${fight.fighter1Id}` : '#'}
                className="flex items-center gap-3 min-w-0 flex-1 group/link"
              >
                <div className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all">
                  {fight.fighter1Img ? (
                    <img src={fight.fighter1Img} alt={fight.fighter1} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">{fight.fighter1?.charAt(0)}</div>
                  )}
                </div>
                <span className="text-white text-sm font-semibold truncate group-hover/link:text-ufc-red transition-colors">{fight.fighter1}</span>
              </Link>
            </div>
            <div className="flex-shrink-0 text-center">
              <span className="text-ufc-red text-[10px] font-bold block">VS</span>
              {fight.weightClass && <span className="text-gray-600 text-[8px] uppercase hidden md:block">{fight.weightClass}</span>}
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <Link
                href={fight.fighter2Id ? `/fighter/${fight.fighter2Id}` : '#'}
                className="flex items-center gap-3 min-w-0 flex-1 justify-end group/link"
              >
                <span className="text-white text-sm font-semibold truncate group-hover/link:text-ufc-red transition-colors">{fight.fighter2}</span>
                <div className="relative w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all">
                  {fight.fighter2Img ? (
                    <img src={fight.fighter2Img} alt={fight.fighter2} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">{fight.fighter2?.charAt(0)}</div>
                  )}
                </div>
              </Link>
            </div>
            {(fight.status || fight.broadcast) && (
              <div className="hidden lg:block w-24 flex-shrink-0 text-center">
                {fight.status === 'final' ? (
                  <span className="text-gray-400 text-[10px]">
                    {fight.fighter1Record?.split('-')[0]}-{fight.fighter2Record?.split('-')[0]}
                  </span>
                ) : (
                  <span className="text-ufc-gold text-[10px] font-semibold uppercase">{fight.broadcast || 'Preview'}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
