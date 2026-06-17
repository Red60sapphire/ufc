import { getEventsWithFightCards, getNewsWithFallback } from "@/lib/ufc-data-fetcher";
import { query } from "@/lib/db";
import { ufcConfig } from "@/lib/ufc-config";
import HeroSection from "@/components/HeroSection";
import FightCardPanel from "@/components/FightCardPanel";
import UpcomingEventsCarousel from "@/components/UpcomingEventsCarousel";
import NewsPanel from "@/components/NewsPanel";
import TaleOfTheTape from "@/components/TaleOfTheTape";
import StreamSection from "@/components/StreamSection";
import ChatBox from "@/components/ChatBox";
import EventCountdown from "@/components/EventCountdown";

export default async function HomePage() {
  const [eventsData, newsData, streams] = await Promise.all([
    getEventsWithFightCards(6),
    getNewsWithFallback(5),
    query`SELECT s.*, u.username FROM streams s JOIN users u ON s.created_by = u.id ORDER BY s.is_live DESC, s.created_at DESC`,
  ]);

  const events = eventsData.length > 0 ? eventsData : [];
  const event = events[0] || ufcConfig.current_event;
  const news = newsData.length > 0 ? newsData : ufcConfig.news;
  const featuredFighter = ufcConfig.featured_fighter;
  const fights = (event as any)?.fights || ufcConfig.current_event.fight_card.main;
  const mainEvent = {
    fighter1: (event as any)?.fighter1 || ufcConfig.current_event.main_event.fighter1,
    fighter2: (event as any)?.fighter2 || ufcConfig.current_event.main_event.fighter2,
    fighter1Img: (event as any)?.fighter1Img || ufcConfig.current_event.main_event.fighter1_img,
    fighter2Img: (event as any)?.fighter2Img || ufcConfig.current_event.main_event.fighter2_img,
    fighter1Record: (event as any)?.fighter1Record || ufcConfig.current_event.main_event.fighter1_record,
    fighter2Record: (event as any)?.fighter2Record || ufcConfig.current_event.main_event.fighter2_record,
    weightClass: ufcConfig.current_event.main_event.weight_class,
    date: event.date,
    venue: event.venue || '',
    eventName: event.name || '',
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="bg-gradient-to-r from-ufc-red/10 via-ufc-red/[0.03] to-transparent text-center py-2.5 border-b border-gray-800/30">
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-ufc-red rounded-full animate-ring-pulse" />
          <span className="text-ufc-red text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold">FREE UFC STREAMS - WATCH LIVE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        <section className="animate-in stagger-1">
          <HeroSection mainEvent={mainEvent} />
        </section>

        {mainEvent.date && events.length > 0 && (
          <section className="animate-in stagger-2">
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 card-hover">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ufc-red rounded-full animate-ring-pulse" />
                  <span className="text-white text-xs uppercase tracking-wider font-semibold">Next Event Countdown</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <EventCountdown targetDate={mainEvent.date} />
                </div>
                <span className="text-gray-500 text-[10px] text-center sm:text-right">
                  {mainEvent.eventName ? <>{mainEvent.eventName}<br /></> : null}
                  {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="animate-in stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
            <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Fight Card</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
          </div>
          <FightCardPanel fights={fights} />
        </section>

        {events.length > 1 && (
          <section className="animate-in stagger-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
              <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Upcoming Events</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
            </div>
            <UpcomingEventsCarousel events={events.slice(1)} />
          </section>
        )}

        <section className="animate-in stagger-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
            <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Stats &amp; News</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FighterCard fighter={featuredFighter} />
            <NewsPanel news={news} />
            <TaleOfTheTape fighter1={mainEvent.fighter1} fighter2={mainEvent.fighter2} fighter1Img={mainEvent.fighter1Img} fighter2Img={mainEvent.fighter2Img} fighter1Record={mainEvent.fighter1Record} fighter2Record={mainEvent.fighter2Record} />
          </div>
        </section>

        {streams.length > 0 && (
          <>
            <div className="glow-line" />
            <section className="animate-in stagger-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Live Streams</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
              </div>
              <StreamSection streams={streams} />
            </section>
          </>
        )}

        {streams.length > 0 && (
          <section className="animate-in stagger-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
              <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">Chat</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
            </div>
            <ChatBox streams={streams} />
          </section>
        )}
      </div>
    </div>
  );
}

function FighterCard({ fighter }: { fighter: any }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover group">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-ufc-red rounded-full" />
          <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Featured Fighter</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700 shadow-lg group-hover:ring-ufc-red/30 transition-all duration-500">
            {fighter.image ? (
              <img src={fighter.image} alt={fighter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-2xl font-bold text-white">
                {fighter.name?.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
          </div>
          <div>
            <h4 className="text-white text-lg font-bold group-hover:text-ufc-red transition-colors">{fighter.name}</h4>
            {fighter.nickname && <p className="text-ufc-gold text-xs">&ldquo;{fighter.nickname}&rdquo;</p>}
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <span>{fighter.weight_class}</span>
              <span className="text-gray-700">•</span>
              <span>{fighter.flag} {fighter.country}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-5">
          {[
            { label: 'Record', value: fighter.record },
            { label: 'Height', value: fighter.height },
            { label: 'Reach', value: fighter.reach },
            { label: 'Stance', value: fighter.stance },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-gray-800/50 rounded-xl p-3 text-center hover:bg-white/[0.05] transition-colors">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{stat.label}</p>
              <p className="text-white text-sm font-bold mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
