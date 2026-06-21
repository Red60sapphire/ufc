import { getEventsWithFightCards, getNewsWithFallback, getRankingsWithAthletes, getAthlete } from "@/lib/ufc-data-fetcher";
import { ufcConfig } from "@/lib/ufc-config";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import FightCardPanel from "@/components/FightCardPanel";
import UpcomingEventsCarousel from "@/components/UpcomingEventsCarousel";
import NewsPanel from "@/components/NewsPanel";
import FightPoll from "@/components/FightPoll";

export default async function HomePage() {
  const [eventsData, newsData, rankingsData] = await Promise.all([
    getEventsWithFightCards(6),
    getNewsWithFallback(5),
    getRankingsWithAthletes(),
  ]);

  const events = eventsData.length > 0 ? eventsData : [];
  const event = events[0] || ufcConfig.current_event;
  const news = newsData.length > 0 ? newsData : ufcConfig.news;
  const featuredFighter = ufcConfig.featured_fighter;
  const fights = (event as any)?.fights || ufcConfig.current_event.fight_card.main;
  const p4p = rankingsData.filter((r: any) => r.name.toLowerCase().includes('pound'));
  const p4pFighters = p4p.flatMap((g: any) => g.ranks.slice(0, 10));
  const fighter1Id = (event as any)?.fights?.find((f: any) => f.fighter1 === event.fighter1)?.fighter1Id || (event as any)?.f1Id || '';
  const fighter2Id = (event as any)?.fights?.find((f: any) => f.fighter2 === event.fighter2)?.fighter2Id || (event as any)?.f2Id || '';

  const now = new Date();
  const todayStr = now.toDateString();
  const liveEvents = events.filter((e: any) => {
    if (e.statusState === 'in') return true;
    const eventDate = new Date(e.date);
    const eventDay = eventDate.toDateString();
    if (eventDay === todayStr) return true;
    const diff = Math.abs(eventDate.getTime() - now.getTime());
    return diff < 14400000 && eventDate <= now;
  });
  const configEventToday = new Date(ufcConfig.current_event.date).toDateString() === todayStr;
  const isLive = liveEvents.length > 0 || (events.length === 0 && configEventToday);

  const [fighter1Data, fighter2Data] = await Promise.all([
    fighter1Id ? getAthlete(fighter1Id).catch(() => null) : null,
    fighter2Id ? getAthlete(fighter2Id).catch(() => null) : null,
  ]);

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
    f1Id: fighter1Id,
    f2Id: fighter2Id,
  };

  const divisions = rankingsData.filter((r: any) => !r.name.toLowerCase().includes('pound') && r.ranks.length > 0);
  const champions = divisions.map((g: any) => ({
    ...g.ranks[0],
    divisionName: g.name,
  })).filter((c: any) => c.athlete);
  const divisionCount = divisions.length;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative bg-gradient-to-r from-ufc-red/10 via-ufc-red/[0.03] to-transparent text-center py-2.5 border-b border-gray-800/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(210,10,10,0.05),transparent_70%)]" />
        <div className="relative flex items-center justify-center gap-3">
          {isLive && (
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-ufc-red animate-ping" /><span className="relative rounded-full bg-ufc-red w-2 h-2" /></span>
          )}
          <span className="text-ufc-red text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold">
            {isLive ? '🔴 LIVE EVENT NOW' : '⚡ FREE UFC COVERAGE'}
          </span>
          <span className="hidden md:inline text-gray-600 text-[10px]">| {events.length} upcoming events</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-24">

        <section className="animate-in stagger-1">
          <HeroSection
            mainEvent={mainEvent}
            fighter1Data={fighter1Data}
            fighter2Data={fighter2Data}
            isLive={isLive}
          />
        </section>

        <section className="animate-in stagger-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard value={events.length} label="Upcoming Events" icon="calendar" />
            <StatCard value={liveEvents.length || 0} label="Live Now" icon="live" />
            <StatCard value={0} label="Replays" icon="replay" />
            <StatCard value={p4pFighters.length + (champions?.length || 0)} label="Ranked" icon="crown" />
            <StatCard value={divisionCount || 8} label="Divisions" icon="scale" />
            <StatCard value={news.length} label="News" icon="news" />
          </div>
        </section>

        <section className="animate-in stagger-2 max-w-xl mx-auto w-full">
          <FightPoll
            fighter1={mainEvent.fighter1}
            fighter2={mainEvent.fighter2}
            fighter1Img={mainEvent.fighter1Img}
            fighter2Img={mainEvent.fighter2Img}
            fighter1Record={mainEvent.fighter1Record}
            fighter2Record={mainEvent.fighter2Record}
            f1Id={fighter1Id}
            f2Id={fighter2Id}
            weightClass={mainEvent.weightClass}
          />
        </section>

        {mainEvent.date && (
          <section className="animate-in stagger-2">
            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-2xl p-6 card-hover overflow-hidden group">
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-ufc-red/[0.04] to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/30 to-transparent" />
              <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-2.5 h-2.5 bg-ufc-red rounded-full animate-ring-pulse" />
                    <div className="w-2.5 h-2.5 bg-ufc-red/60 rounded-full animate-ring-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="w-2.5 h-2.5 bg-ufc-red/30 rounded-full animate-ring-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="text-white text-xs uppercase tracking-[0.2em] font-semibold">Next Event</span>
                </div>
                <div className="flex items-center gap-6">
                  <CountdownTimer targetDate={mainEvent.date} />
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-gray-300 text-sm font-semibold">{mainEvent.fighter1} vs {mainEvent.fighter2}</p>
                  <p className="text-gray-600 text-xs">
                    {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <Link href={`/events/${mainEvent.eventId}`} className="inline-block text-ufc-red text-xs font-semibold hover:text-red-300 transition mt-1">
                    Event Details →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="animate-in stagger-3">
          <SectionHeader label="Fight Card">
            <Link href={`/events/${mainEvent.eventId}`} className="text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-300 transition">Full Card →</Link>
          </SectionHeader>
          <FightCardPanel fights={fights} />
        </section>

        {champions.length > 1 && (
          <section className="animate-in stagger-3">
            <SectionHeader label="Champions" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {champions.slice(0, 12).map((c: any) => (
                <Link key={c.athleteId} href={`/fighter/${c.athleteId}`}
                  className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-xl p-4 text-center card-hover"
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-gold/20 to-transparent blur-lg" />
                    <div className="relative w-full h-full rounded-full bg-gray-800 overflow-hidden ring-2 ring-ufc-gold/30 group-hover:ring-ufc-gold/60 transition-all">
                      {c.athlete?.image ? (
                        <img src={c.athlete.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ufc-gold text-lg font-bold">👑</div>
                      )}
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold truncate group-hover:text-ufc-gold transition-colors">
                    {c.athlete?.name?.split(' ').pop() || `#${c.athleteId}`}
                  </p>
                  <p className="text-ufc-gold text-[9px] mt-0.5 truncate">{c.divisionName?.replace(' Rankings', '')}</p>
                  <p className="text-gray-600 text-[9px]">{c.athlete?.record || ''}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {p4pFighters.length > 0 && (
          <section className="animate-in stagger-3">
            <SectionHeader label="Pound for Pound">
              <Link href="/rankings" className="text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-300 transition">All Rankings →</Link>
            </SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {p4pFighters.map((entry: any) => (
                <Link
                  key={entry.athleteId}
                  href={`/fighter/${entry.athleteId}`}
                  className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-xl p-4 text-center card-hover"
                >
                  <div className="relative w-14 h-14 mx-auto mb-2.5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-md group-hover:blur-xl transition-all" />
                    <div className="relative w-full h-full rounded-full bg-gray-800 overflow-hidden ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all">
                      {entry.athlete?.image ? (
                        <img src={entry.athlete.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">{entry.athlete?.name?.charAt(0) || '?'}</div>
                      )}
                    </div>
                    {entry.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-ufc-red rounded-full flex items-center justify-center text-[10px] shadow-lg shadow-red-900/50">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold truncate group-hover:text-ufc-red transition-colors">
                    {entry.athlete?.name?.split(' ').pop() || `#${entry.athleteId}`}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-gray-500 text-[10px] font-bold">#{entry.rank}</span>
                    {entry.athlete?.record && <><span className="text-gray-700">·</span><span className="text-gray-500 text-[9px]">{entry.athlete.record}</span></>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 1 && (
          <section className="animate-in stagger-4">
            <SectionHeader label="Upcoming Events">
              <Link href="/events" className="text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-300 transition">All Events →</Link>
            </SectionHeader>
            <UpcomingEventsCarousel events={events.slice(1)} />
          </section>
        )}

        {divisions.length > 0 && (
          <section className="animate-in stagger-4">
            <SectionHeader label="Rankings Preview">
              <Link href="/rankings" className="text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-300 transition">Full Rankings →</Link>
            </SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {divisions.slice(0, 6).map((group: any) => (
                <div key={group.id} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-xl overflow-hidden card-hover">
                  <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-4 py-2.5 border-b border-gray-800/50">
                    <p className="text-white text-[11px] uppercase tracking-wider font-bold truncate">
                      {group.name.replace('Men\'s ', '').replace('Women\'s ', '').replace(' Rankings', '')}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-800/40">
                    {group.ranks.slice(0, 5).map((entry: any) => (
                      <Link key={entry.athleteId} href={`/fighter/${entry.athleteId}`}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02] transition-colors group/row"
                      >
                        <span className={`w-5 text-center text-xs font-bold ${entry.rank === 1 ? 'text-ufc-gold' : 'text-gray-600'}`}>
                          {entry.rank === 1 ? 'C' : `#${entry.rank}`}
                        </span>
                        <span className="text-white text-xs font-medium truncate flex-1 group-hover/row:text-ufc-red transition-colors">
                          {entry.athlete?.name || `Fighter #${entry.athleteId}`}
                        </span>
                        <span className="text-gray-600 text-[10px]">{entry.athlete?.record || ''}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}



        <section className="animate-in stagger-5">
          <SectionHeader label="News & Spotlight" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FighterCard fighter={featuredFighter} />
            <NewsPanel news={news} />
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-2xl p-6 card-hover group">
              <div className="bg-gradient-to-r from-ufc-red/10 to-transparent -mx-6 -mt-6 px-6 py-4 border-b border-gray-800/60 mb-5">
                <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Quick Links</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Fighter Directory', href: '/fighters', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { label: 'Head to Head', href: '/head-to-head', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { label: 'Events Calendar', href: '/events', icon: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' },
                  { label: 'Rankings', href: '/rankings', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                  { label: 'Replay Library', href: '/replays', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
                  { label: 'News', href: '/news', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group/link"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700/30 flex items-center justify-center group-hover/link:border-ufc-red/30 transition-colors">
                      <svg className="w-4 h-4 text-gray-500 group-hover/link:text-ufc-red transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d={item.icon} /></svg>
                    </div>
                    <span className="text-gray-300 text-xs font-medium group-hover/link:text-white transition-colors">{item.label}</span>
                    <svg className="w-3 h-3 text-gray-600 ml-auto group-hover/link:text-ufc-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  return (
    <div className="flex items-center gap-3">
      {(() => {
        const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff / 3600000) % 24);
        const minutes = Math.floor((diff / 60000) % 60);
        return (
          <>
            {[
              { label: 'Days', value: days },
              { label: 'Hrs', value: hours },
              { label: 'Min', value: minutes },
            ].map((u) => (
              <div key={u.label} className="text-center">
                <div className="bg-white/[0.04] border border-gray-800/50 rounded-lg px-3 py-1.5 min-w-[42px]">
                  <span className="text-base md:text-lg font-bold text-white tabular-nums">{String(u.value).padStart(2, '0')}</span>
                </div>
                <span className="text-gray-600 text-[8px] uppercase tracking-wider mt-0.5 block">{u.label}</span>
              </div>
            ))}
          </>
        );
      })()}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  const icons: Record<string, { viewBox: string; path: string }> = {
    calendar: { viewBox: "0 0 20 20", path: "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" },
    crown: { viewBox: "0 0 20 20", path: "M3 16l-2-5 4-1 5-5 5 5 4 1-2 5H3z" },
    scale: { viewBox: "0 0 20 20", path: "M10 2a1 1 0 011 1v1h3a1 1 0 110 2h-3v10h3a1 1 0 110 2H6a1 1 0 110-2h3V6H6a1 1 0 010-2h3V3a1 1 0 011-1z" },
    news: { viewBox: "0 0 20 20", path: "M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 1v1h3V7H6zm0 3v1h8v-1H6zm0 3v1h8v-1H6z" },
    live: { viewBox: "0 0 20 20", path: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" },
    replay: { viewBox: "0 0 20 20", path: "M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm2 1v1h3V7H6zm0 3v1h8v-1H6zm0 3v1h8v-1H6z" },
  };
  const svg = icons[icon] || icons.calendar;

  return (
    <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-xl p-4 md:p-5 text-center card-hover group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ufc-red/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-9 h-9 md:w-10 md:h-10 mx-auto mb-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 flex items-center justify-center group-hover:border-ufc-red/30 transition-colors duration-300">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-ufc-red transition-colors duration-300" fill="currentColor" viewBox={svg.viewBox}>
            <path d={svg.path} />
          </svg>
        </div>
        <p className="text-white text-xl md:text-3xl font-black group-hover:tracking-wider transition-all duration-300">{value}</p>
        <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
}

function SectionHeader({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-ufc-red rounded-full" />
        <h2 className="text-gray-300 text-xs md:text-sm uppercase tracking-[0.3em] font-semibold">{label}</h2>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-gray-800/60 to-transparent" />
      {children}
    </div>
  );
}

function FighterCard({ fighter }: { fighter: any }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-2xl overflow-hidden card-hover group">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-4 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-ufc-red rounded-full" />
          <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Fighter Spotlight</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700 shadow-lg group-hover:ring-ufc-red/30 transition-all duration-500">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {fighter.image ? (
              <img src={fighter.image} alt={fighter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-2xl font-bold text-white">
                {fighter.name?.charAt(0)}
              </div>
            )}
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
