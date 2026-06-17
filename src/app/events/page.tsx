import { getEventsWithFightCards } from "@/lib/ufc-data-fetcher";

export default async function EventsPage() {
  const events = await getEventsWithFightCards(12);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-6">Upcoming UFC Events</h1>

        {events.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition group">
                <div className="bg-gradient-to-r from-ufc-red/20 to-transparent px-4 py-2">
                  <span className="text-ufc-red text-[10px] uppercase tracking-wider font-semibold">UFC EVENT</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white text-sm font-bold group-hover:text-ufc-red transition line-clamp-2">{event.name}</h3>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-gray-500 text-xs">{event.venue || event.location || 'TBA'}</p>

                  {event.fights && event.fights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {event.fights.slice(0, 3).map((fight: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-[#1a1a1a] rounded p-2">
                          <div className="flex items-center gap-2 max-w-[40%]">
                            <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
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
                          <span className="text-ufc-red text-[10px] font-bold mx-1">VS</span>
                          <div className="flex items-center gap-2 max-w-[40%] justify-end">
                            <span className="text-gray-300 text-xs font-medium truncate">{fight.fighter2 || fight.fighter2Name}</span>
                            <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
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

                  <button className="w-full mt-4 border border-gray-700 text-gray-300 py-2 text-xs uppercase tracking-wider rounded hover:bg-gray-800 transition">
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
