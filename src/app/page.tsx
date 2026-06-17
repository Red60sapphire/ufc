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
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent text-center py-2">
        <span className="text-ufc-red text-xs uppercase tracking-widest font-semibold">FREE UFC STREAMS - WATCH LIVE</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <HeroSection mainEvent={mainEvent} />

        <FightCardPanel fights={fights} />

        <UpcomingEventsCarousel events={events.slice(1)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FighterCard fighter={featuredFighter} />

          <NewsPanel news={news} />

          <TaleOfTheTape fighter1={mainEvent.fighter1} fighter2={mainEvent.fighter2} fighter1Img={mainEvent.fighter1Img} fighter2Img={mainEvent.fighter2Img} fighter1Record={mainEvent.fighter1Record} fighter2Record={mainEvent.fighter2Record} />
        </div>

        {streams.length > 0 && <StreamSection streams={streams} />}

        {streams.length > 0 && <ChatBox streams={streams} />}
      </div>
    </div>
  );
}

function FighterCard({ fighter }: { fighter: any }) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
      <h3 className="text-ufc-red text-sm uppercase tracking-wider font-semibold mb-3">Featured Fighter</h3>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-2xl font-bold text-gray-500">
            {fighter.name.charAt(0)}
          </div>
        </div>
        <div>
          <h4 className="text-white text-lg font-bold">{fighter.name}</h4>
          {fighter.nickname && <p className="text-gray-400 text-xs">&quot;{fighter.nickname}&quot;</p>}
          <p className="text-gray-500 text-xs mt-1">{fighter.weight_class} • {fighter.flag} {fighter.country}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-center">
        {[
          { label: 'Record', value: fighter.record },
          { label: 'Height', value: fighter.height },
          { label: 'Reach', value: fighter.reach },
          { label: 'Stance', value: fighter.stance },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a1a] rounded p-2">
            <p className="text-gray-500 text-xs uppercase">{stat.label}</p>
            <p className="text-white text-sm font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
