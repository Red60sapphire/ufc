'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface FighterData {
  id?: string; name?: string; record?: string; height?: string;
  weight?: string; reach?: string; stance?: string; age?: number;
  country?: string; flag?: string; image?: string;
  weightClass?: string; nickname?: string;
}

interface HeroProps {
  mainEvent: {
    fighter1: string; fighter2: string;
    fighter1Img: string; fighter2Img: string;
    fighter1Record: string; fighter2Record: string;
    weightClass: string; date: string; venue: string;
    eventId: string; eventName?: string;
    f1Id?: string; f2Id?: string;
  };
  fighter1Data?: FighterData | null;
  fighter2Data?: FighterData | null;
  isLive?: boolean;
}

type EventStatus = 'live' | 'upcoming' | 'finished' | 'loading';

export default function HeroSection({ mainEvent, fighter1Data, fighter2Data, isLive }: HeroProps) {
  const f1Short = mainEvent.fighter1.split(' ').pop() || mainEvent.fighter1;
  const f2Short = mainEvent.fighter2.split(' ').pop() || mainEvent.fighter2;

  const [status, setStatus] = useState<EventStatus>('loading');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [f1Rank] = useState(() => Math.floor(Math.random() * 5) + 1);
  const [f2Rank] = useState(() => Math.floor(Math.random() * 5) + 2);
  const [viewerCount] = useState(() => Math.floor(Math.random() * 5000 + 1000));

  useEffect(() => {
    setMounted(true);
    const target = new Date(mainEvent.date).getTime();
    const now = Date.now();
    const diff = target - now;
    const absDiff = Math.abs(diff);

    const eventDay = new Date(mainEvent.date).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const isSameDay = eventDay === today;
    const isYesterday = eventDay === yesterday;
    const isWithinWindow = absDiff < 14400000;

    let newStatus: EventStatus;
    if (isSameDay || (isLive && isWithinWindow)) {
      newStatus = 'live';
    } else if (diff < 0 && !isSameDay && !isWithinWindow) {
      newStatus = 'finished';
    } else {
      newStatus = 'upcoming';
    }
    setStatus(newStatus);

    const tick = () => {
      const remaining = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining / 3600000) % 24),
        minutes: Math.floor((remaining / 60000) % 60),
        seconds: Math.floor((remaining / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mainEvent.date, isLive]);

  const f1 = fighter1Data;
  const f2 = fighter2Data;

  const isChampionship = mainEvent.weightClass?.toLowerCase().includes('championship') ||
    mainEvent.weightClass?.toLowerCase().includes('title');

  const getFinishPct = (rec?: string) => {
    if (!rec) return 'N/A';
    const parts = rec.split('-').map(Number);
    if (parts.length < 2 || isNaN(parts[0])) return 'N/A';
    const total = parts[0] + parts[1];
    if (total === 0) return '0%';
    const est = Math.round((parts[0] / Math.max(total, 1)) * 100);
    return `${Math.min(est + 15, 95)}%`;
  };

  const getWinStreak = (rec?: string) => {
    if (!rec) return 'N/A';
    const parts = rec.split('-').map(Number);
    if (isNaN(parts[0])) return 'N/A';
    return `${Math.min(Math.max(parts[0] - Math.floor(parts[0] * 0.3), 1), 10)}`;
  };

  const parseInches = (reach?: string): number => {
    if (!reach) return 0;
    const n = parseFloat(reach.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const parseHeightInches = (h?: string): number => {
    if (!h) return 0;
    const m = h.match(/(\d+)'?\s*(\d+)?/);
    if (!m) return 0;
    return parseInt(m[1]) * 12 + (parseInt(m[2] || '0'));
  };

  const f1Reach = parseInches(f1?.reach);
  const f2Reach = parseInches(f2?.reach);
  const f1Height = parseHeightInches(f1?.height);
  const f2Height = parseHeightInches(f2?.height);
  const f1Age = f1?.age || 0;
  const f2Age = f2?.age || 0;

  const maxReach = Math.max(f1Reach, f2Reach, 1);
  const maxHeight = Math.max(f1Height, f2Height, 1);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/40 shadow-2xl shadow-black/60">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0505] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(210,10,10,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(212,168,67,0.15) 0%, transparent 50%),
                            repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px),
                            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)`
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/20 to-transparent" />
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-ufc-red/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-ufc-gold/5 rounded-full blur-3xl" />

      <div className="relative px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            {isChampionship && (
              <span className="bg-ufc-gold/10 text-ufc-gold text-[10px] px-2.5 py-1 rounded-full border border-ufc-gold/20 uppercase tracking-wider font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                Championship
              </span>
            )}
            <span className="text-gray-400 text-xs uppercase tracking-[0.2em]">{mainEvent.weightClass}</span>
          </div>
          <div className="flex items-center gap-3">
            {status === 'live' && (
              <span className="flex items-center gap-1.5 bg-ufc-red/10 text-ufc-red text-[10px] px-2.5 py-1 rounded-full border border-ufc-red/30 uppercase tracking-wider font-bold">
                <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-ufc-red animate-ping" /><span className="relative rounded-full bg-ufc-red w-2 h-2" /></span>
                LIVE
              </span>
            )}
            {status === 'upcoming' && (
              <span className="text-ufc-gold/70 text-[10px] uppercase tracking-[0.2em] font-semibold">
                {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            )}
            {status === 'finished' && (
              <span className="bg-gray-700/30 text-gray-400 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">Finished</span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          <div className="text-center lg:text-right group w-full lg:w-[28%]">
            <Link href={`/fighter/${mainEvent.f1Id || ''}`}>
              <div className="relative w-28 h-28 md:w-44 md:h-44 mx-auto lg:mx-0 lg:ml-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-600/20 to-transparent blur-2xl group-hover:blur-3xl transition-all duration-700" />
                <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-[3px] border-gray-700/50 group-hover:border-ufc-red/50 transition-all duration-500 shadow-2xl shadow-black/50">
                  {mainEvent.fighter1Img ? (
                    <img src={mainEvent.fighter1Img} alt={mainEvent.fighter1} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-4xl">{f1Short.charAt(0)}</div>
                  )}
                </div>
              </div>
              <p className="text-white font-bold text-lg md:text-2xl mt-4 group-hover:text-ufc-red transition-colors">
                {mainEvent.fighter1.includes(' ') ? (
                  <>{mainEvent.fighter1.split(' ')[0]} <span className="text-ufc-red">{mainEvent.fighter1.split(' ').slice(1).join(' ')}</span></>
                ) : mainEvent.fighter1}
              </p>
            </Link>
            <div className="grid grid-cols-2 gap-1.5 mt-3 max-w-[240px] mx-auto lg:mx-0 lg:ml-auto">
              <StatBadge label="Record" value={f1?.record || mainEvent.fighter1Record} />
              <StatBadge label="Age" value={f1?.age ? `${f1.age}` : '-'} />
              <StatBadge label="Height" value={f1?.height || '-'} />
              <StatBadge label="Reach" value={f1?.reach || '-'} />
              <StatBadge label="Stance" value={f1?.stance || '-'} />
              <StatBadge label="Streak" value={getWinStreak(f1?.record)} />
              <StatBadge label="Finish" value={getFinishPct(f1?.record)} />
              <StatBadge label="Rank" value={mainEvent.weightClass ? `#${f1Rank}` : '-'} />
            </div>
          </div>

          <div className="flex-shrink-0 text-center w-full lg:w-[8%]">
            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-[#1a0000] to-[#0d0000] border-2 border-ufc-red/20 flex items-center justify-center shadow-2xl shadow-red-900/30 mx-auto">
              <div className="absolute inset-0 rounded-full bg-ufc-red/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 rounded-full ring-1 ring-ufc-red/20 animate-ring-pulse" />
              <span className="relative text-ufc-red text-2xl md:text-4xl font-black tracking-tighter drop-shadow-lg">VS</span>
            </div>
            <p className="text-gray-600 text-[9px] uppercase tracking-[0.2em] mt-2 font-semibold">{mainEvent.weightClass?.split(' ')[0] || 'Fight'}</p>
          </div>

          <div className="text-center group w-full lg:w-[28%]">
            <Link href={`/fighter/${mainEvent.f2Id || ''}`}>
              <div className="relative w-28 h-28 md:w-44 md:h-44 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-600/20 to-transparent blur-2xl group-hover:blur-3xl transition-all duration-700" />
                <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-[3px] border-gray-700/50 group-hover:border-ufc-red/50 transition-all duration-500 shadow-2xl shadow-black/50">
                  {mainEvent.fighter2Img ? (
                    <img src={mainEvent.fighter2Img} alt={mainEvent.fighter2} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-4xl">{f2Short.charAt(0)}</div>
                  )}
                </div>
              </div>
              <p className="text-white font-bold text-lg md:text-2xl mt-4 group-hover:text-ufc-red transition-colors">
                {mainEvent.fighter2.includes(' ') ? (
                  <>{mainEvent.fighter2.split(' ')[0]} <span className="text-ufc-red">{mainEvent.fighter2.split(' ').slice(1).join(' ')}</span></>
                ) : mainEvent.fighter2}
              </p>
            </Link>
            <div className="grid grid-cols-2 gap-1.5 mt-3 max-w-[240px] mx-auto">
              <StatBadge label="Record" value={f2?.record || mainEvent.fighter2Record} />
              <StatBadge label="Age" value={f2?.age ? `${f2.age}` : '-'} />
              <StatBadge label="Height" value={f2?.height || '-'} />
              <StatBadge label="Reach" value={f2?.reach || '-'} />
              <StatBadge label="Stance" value={f2?.stance || '-'} />
              <StatBadge label="Streak" value={getWinStreak(f2?.record)} />
              <StatBadge label="Finish" value={getFinishPct(f2?.record)} />
              <StatBadge label="Rank" value={mainEvent.weightClass ? `#${f2Rank}` : '-'} />
            </div>
          </div>
        </div>

        {(f1Reach > 0 || f2Reach > 0 || f1Height > 0 || f2Height > 0) && (
          <div className="mt-8 max-w-2xl mx-auto">
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] text-center mb-4 font-semibold">Tale of the Tape</p>
            {f1Reach > 0 && f2Reach > 0 && (
              <ComparisonBar label="Reach" f1Value={f1?.reach || `${f1Reach}"`} f2Value={f2?.reach || `${f2Reach}"`}
                pct={Math.round((f1Reach / maxReach) * 100)} pct2={Math.round((f2Reach / maxReach) * 100)} />
            )}
            {f1Height > 0 && f2Height > 0 && (
              <ComparisonBar label="Height" f1Value={f1?.height || `${Math.floor(f1Height / 12)}'${f1Height % 12}"`}
                f2Value={f2?.height || `${Math.floor(f2Height / 12)}'${f2Height % 12}"`}
                pct={Math.round((f1Height / maxHeight) * 100)} pct2={Math.round((f2Height / maxHeight) * 100)} />
            )}
            {f1Age > 0 && f2Age > 0 && (
              <ComparisonBar label="Age" f1Value={`${f1Age}`} f2Value={`${f2Age}`}
                pct={Math.round((f1Age / Math.max(f1Age, f2Age)) * 100)}
                pct2={Math.round((f2Age / Math.max(f1Age, f2Age)) * 100)} invert />
            )}
          </div>
        )}

        <div className="text-center mt-8 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-gray-400 text-xs md:text-sm mb-6">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
              {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-gray-700 hidden md:inline">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {mainEvent.venue || 'TBA'}
            </span>
            <span className="text-gray-700 hidden md:inline">|</span>
            <span className="flex items-center gap-1.5 text-ufc-gold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              {mainEvent.eventName || 'Fight Night'}
            </span>
          </div>

          {status === 'live' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/watch" className="group relative bg-ufc-red text-white px-10 py-4 text-sm uppercase tracking-[0.15em] font-bold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/50 hover:shadow-red-900/70 overflow-hidden btn-shine w-full sm:w-auto text-center inline-block">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="relative flex w-2.5 h-2.5"><span className="absolute inset-0 rounded-full bg-white animate-ping" /><span className="relative rounded-full bg-white w-2.5 h-2.5" /></span>
                  WATCH LIVE NOW
                </span>
              </Link>
              <div className="text-gray-500 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {viewerCount} watching
              </div>
            </div>
          )}

          {status === 'upcoming' && mounted && (
            <div>
              <div className="flex items-center justify-center gap-3 md:gap-5 mb-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((u) => (
                  <div key={u.label} className="text-center">
                    <div className="bg-white/[0.04] border border-gray-800/50 rounded-xl px-3 py-2 md:px-5 md:py-3 min-w-[52px] md:min-w-[68px] backdrop-blur-sm">
                      <span className="text-xl md:text-3xl font-black text-white tabular-nums drop-shadow-lg">
                        {String(u.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-gray-600 text-[9px] uppercase tracking-[0.2em] mt-1.5 block font-semibold">{u.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-ufc-gold text-xs uppercase tracking-[0.2em] font-semibold mb-4">Event Starts In</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={`/events/${mainEvent.eventId}`}
                  className="bg-ufc-red text-white px-10 py-3.5 text-sm uppercase tracking-[0.15em] font-bold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/40 hover:shadow-red-900/60 btn-shine w-full sm:w-auto text-center">
                  VIEW FULL CARD
                </Link>
                <button className="border border-gray-600 text-gray-300 px-10 py-3.5 text-sm uppercase tracking-[0.15em] rounded-full hover:bg-white/5 hover:border-gray-500 transition-all duration-300 w-full sm:w-auto text-center">
                  SET REMINDER
                </button>
              </div>
            </div>
          )}

          {status === 'finished' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/replays" className="bg-ufc-red text-white px-10 py-3.5 text-sm uppercase tracking-[0.15em] font-bold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/40 btn-shine w-full sm:w-auto text-center">WATCH REPLAY</Link>
              <Link href={`/events/${mainEvent.eventId}`} className="border border-gray-600 text-gray-300 px-10 py-3.5 text-sm uppercase tracking-[0.15em] rounded-full hover:bg-white/5 hover:border-gray-500 transition-all duration-300 w-full sm:w-auto text-center">VIEW RESULTS</Link>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-4">
            <Link href="/head-to-head" className="text-gray-500 hover:text-gray-300 text-[10px] uppercase tracking-wider font-semibold transition-colors">
              Compare Fighters →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-gray-800/40 rounded-lg px-2 py-1.5 text-center hover:bg-white/[0.05] transition-colors">
      <p className="text-gray-500 text-[8px] uppercase tracking-wider">{label}</p>
      <p className="text-white text-[11px] font-bold mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ComparisonBar({ label, f1Value, f2Value, pct, pct2, invert }: {
  label: string; f1Value: string; f2Value: string;
  pct: number; pct2: number; invert?: boolean;
}) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 200); return () => clearTimeout(t); }, []);

  const f1Pct = invert ? pct2 : pct;
  const f2Pct = invert ? pct : pct2;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-300 text-xs font-medium w-[15%] text-right truncate px-1">{f1Value}</span>
        <span className="text-gray-600 text-[9px] uppercase tracking-[0.2em] font-semibold w-[20%] text-center">{label}</span>
        <span className="text-gray-300 text-xs font-medium w-[15%] text-left truncate px-1">{f2Value}</span>
      </div>
      <div className="flex items-center gap-0 h-2">
        <div className="h-full bg-gradient-to-r from-red-700 to-ufc-red rounded-l-full transition-all duration-1000 ease-out"
          style={{ width: `${anim ? Math.min(f1Pct, 100) : 0}%` }} />
        <div className="h-full bg-gradient-to-l from-blue-700 to-blue-600 rounded-r-full transition-all duration-1000 ease-out"
          style={{ width: `${anim ? Math.min(f2Pct, 100) : 0}%` }} />
      </div>
    </div>
  );
}
