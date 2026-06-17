import { getEventsWithFightCards } from "@/lib/ufc-data-fetcher";

export default async function EventsPage() {
  const events = await getEventsWithFightCards(12);

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">Upcoming UFC Events</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with the latest fight cards</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 text-sm">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover group">
                <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-3 border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-ufc-red text-[10px] uppercase tracking-wider font-semibold">UFC EVENT</span>
                    <span className="text-[10px] text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white text-sm font-bold group-hover:text-ufc-red transition-colors line-clamp-2 leading-relaxed">{event.name}</h3>
                  <p className="text-gray-400 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {event.venue || event.location || 'TBA'}
                  </p>

                  {event.fights && event.fights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {event.fights.slice(0, 3).map((fight: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-xl p-2.5 hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-center gap-2 min-w-0 max-w-[40%]">
                            <div className="w-7 h-7 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-1 ring-gray-700">
                              {fight.fighter1Img ? (
                                <img src={fight.fighter1Img} alt={fight.fighter1} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-[8px] font-bold">
                                  {fight.fighter1?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-300 text-xs font-medium truncate">{fight.fighter1 || fight.fighter1Name}</span>
                          </div>
                          <span className="text-ufc-red text-[9px] font-bold mx-1 flex-shrink-0">VS</span>
                          <div className="flex items-center gap-2 min-w-0 max-w-[40%] justify-end">
                            <span className="text-gray-300 text-xs font-medium truncate">{fight.fighter2 || fight.fighter2Name}</span>
                            <div className="w-7 h-7 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-1 ring-gray-700">
                              {fight.fighter2Img ? (
                                <img src={fight.fighter2Img} alt={fight.fighter2} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-[8px] font-bold">
                                  {fight.fighter2?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="w-full mt-4 border border-gray-700/50 text-gray-400 py-2.5 text-xs uppercase tracking-wider rounded-xl hover:bg-white/5 hover:border-gray-600 hover:text-white transition-all duration-300">
                    View Full Card
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
