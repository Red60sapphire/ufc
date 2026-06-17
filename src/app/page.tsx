import { getEventsWithFightCards, getNewsWithFallback, getRankingsWithAthletes } from "@/lib/ufc-data-fetcher";
import { query } from "@/lib/db";
import { ufcConfig } from "@/lib/ufc-config";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import FightCardPanel from "@/components/FightCardPanel";
import UpcomingEventsCarousel from "@/components/UpcomingEventsCarousel";
import NewsPanel from "@/components/NewsPanel";
import TaleOfTheTape from "@/components/TaleOfTheTape";
import StreamSection from "@/components/StreamSection";
import ChatBox from "@/components/ChatBox";
import EventCountdown from "@/components/EventCountdown";

export default async function HomePage() {
  const [eventsData, newsData, streams, rankingsData, replaysData] = await Promise.all([
    getEventsWithFightCards(6),
    getNewsWithFallback(5),
    query`SELECT s.*, u.username FROM streams s JOIN users u ON s.created_by = u.id ORDER BY s.is_live DESC, s.created_at DESC`,
    getRankingsWithAthletes(),
    query`SELECT * FROM ufc_replays WHERE published = 1 ORDER BY created_at DESC LIMIT 8`,
  ]);

  const events = eventsData.length > 0 ? eventsData : [];
  const event = events[0] || ufcConfig.current_event;
  const news = newsData.length > 0 ? newsData : ufcConfig.news;
  const featuredFighter = ufcConfig.featured_fighter;
  const fights = (event as any)?.fights || ufcConfig.current_event.fight_card.main;
  const replays: any[] = replaysData as any[];
  const p4p = rankingsData.filter((r: any) => r.name.toLowerCase().includes('pound'));
  const p4pFighters = p4p.flatMap((g: any) => g.ranks.slice(0, 5));

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
    eventId: event.id || '',
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative bg-gradient-to-r from-ufc-red/10 via-ufc-red/[0.03] to-transparent text-center py-2.5 border-b border-gray-800/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(210,10,10,0.05),transparent_70%)]" />
        <div className="relative flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-ufc-red rounded-full animate-ring-pulse" />
          <span className="text-ufc-red text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold">FREE UFC STREAMS - WATCH LIVE</span>
          <span className="hidden md:inline text-gray-600 text-[10px]">| {events.length} upcoming events</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-20">
        <section className="animate-in stagger-1">
          <HeroSection mainEvent={mainEvent} />
        </section>

        <section className="animate-in stagger-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon="🔥" label="Upcoming Events" value={events.length} />
            <StatCard icon="🎬" label="Fight Replays" value={replays.length} />
            <StatCard icon="👑" label="Ranked Fighters" value={p4pFighters.length} />
            <StatCard icon="📰" label="Latest News" value={news.length} />
          </div>
        </section>

        {mainEvent.date && events.length > 0 && (
          <section className="animate-in stagger-2">
            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 card-hover overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-ufc-red/[0.03] to-transparent" />
              <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <span className="w-2 h-2 bg-ufc-red rounded-full animate-ring-pulse" />
                    <span className="w-2 h-2 bg-ufc-red/60 rounded-full animate-ring-pulse" style={{ animationDelay: '0.5s' }} />
                    <span className="w-2 h-2 bg-ufc-red/30 rounded-full animate-ring-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="text-white text-xs uppercase tracking-wider font-semibold">Next Event</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <EventCountdown targetDate={mainEvent.date} />
                </div>
                <div className="text-center sm:text-right">
                  <Link href={`/events/${mainEvent.eventId}`} className="text-ufc-red text-xs font-semibold hover:text-red-300 transition">
                    {mainEvent.eventName || 'View Event'} →
                  </Link>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="animate-in stagger-3">
          <SectionHeader label="Fight Card" action={{ href: `/events/${mainEvent.eventId}`, text: 'Full Card →' }} />
          <FightCardPanel fights={fights} />
        </section>

        {p4pFighters.length > 0 && (
          <section className="animate-in stagger-3">
            <SectionHeader label="Pound for Pound Rankings" action={{ href: '/rankings', text: 'All Rankings →' }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {p4pFighters.map((entry: any) => (
                <Link
                  key={entry.athleteId}
                  href={`/fighter/${entry.athleteId}`}
                  className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 text-center card-hover"
                >
                  <div className="relative w-14 h-14 mx-auto mb-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-md group-hover:blur-xl transition-all" />
                    <div className="relative w-full h-full rounded-full bg-gray-800 overflow-hidden ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all">
                      {entry.athlete?.image ? (
                        <img src={entry.athlete.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">
                          {entry.athlete?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold truncate group-hover:text-ufc-red transition-colors">
                    {entry.athlete?.name?.split(' ').pop() || `#${entry.athleteId}`}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold ${entry.rank <= 3 ? 'text-ufc-red' : 'text-gray-500'}`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                    {entry.athlete?.record && (
                      <span className="text-gray-500 text-[9px]">{entry.athlete.record}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {replays.length > 0 && (
          <section className="animate-in stagger-4">
            <SectionHeader label="Latest Replays" action={{ href: '/replays', text: 'All Replays →' }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {replays.map((replay: any) => (
                <Link
                  key={replay.id}
                  href={`/replays/${replay.slug || replay.id}`}
                  className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl overflow-hidden card-hover"
                >
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    {replay.thumbnail ? (
                      <img src={replay.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                      {replay.weight_class?.split(' ')[0] || 'MMA'}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-[10px] mb-1">
                      <span className="text-ufc-red font-semibold uppercase tracking-wider">{replay.fighter1}</span>
                      <span className="text-gray-600">VS</span>
                      <span className="text-gray-300 font-semibold truncate">{replay.fighter2}</span>
                    </div>
                    <p className="text-gray-600 text-[9px] truncate">
                      {replay.event_name || ''} · {replay.event_date ? new Date(replay.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 1 && (
          <section className="animate-in stagger-4">
            <SectionHeader label="Upcoming Events" action={{ href: '/events', text: 'All Events →' }} />
            <UpcomingEventsCarousel events={events.slice(1)} />
          </section>
        )}

        <section className="animate-in stagger-5">
          <SectionHeader label="Stats & News" />
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
              <SectionHeader label="Live Streams" />
              <StreamSection streams={streams} />
            </section>
          </>
        )}

        {streams.length > 0 && (
          <section className="animate-in stagger-5">
            <SectionHeader label="Chat" />
            <ChatBox streams={streams} />
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 text-center card-hover group">
      <span className="text-lg md:text-xl block mb-1">{icon}</span>
      <p className="text-white text-lg md:text-2xl font-black group-hover:text-ufc-red transition-colors">{value}</p>
      <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeader({ label, action }: { label: string; action?: { href: string; text: string } }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
      <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-semibold">{label}</span>
      {action && (
        <Link href={action.href} className="text-ufc-red text-[10px] uppercase tracking-wider font-semibold hover:text-red-300 transition whitespace-nowrap">
          {action.text}
        </Link>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent" />
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
