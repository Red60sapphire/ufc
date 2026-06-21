'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Source {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  error?: string;
}

const FALLBACK_SOURCES: Source[] = [
  { id: 'soccerball', name: 'Soccer Ball', url: 'https://soccerball.st/rampages/unoairuf/', verified: true },
  { id: 'statusnode', name: 'StatusNode', url: 'https://statusnode.is/nodejs/?t=2', verified: true },
  { id: 'streamscenter', name: 'Streams Center', url: 'https://streams.center/embed/ch48.php', verified: true },
];

const CHAT_SRC = 'https://www.youtube.com/live_chat?v=RlrRro00XYY&embed_domain=www.ufc.solutions';
const LOAD_TIMEOUT = 20000;

export default function WatchPage() {
  const playerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sourceScroller = useRef<HTMLDivElement>(null);

  const [sources, setSources] = useState<Source[]>(FALLBACK_SOURCES);
  const [activeSource, setActiveSource] = useState<Source>(FALLBACK_SOURCES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [theater, setTheater] = useState(false);
  const [fs, setFs] = useState(false);
  const [showCtl, setShowCtl] = useState(true);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const originalOpen = window.open;
    window.open = function () { return null; };
    return () => { window.open = originalOpen; };
  }, []);

  const changeSource = useCallback((source: Source) => {
    if (source.id === activeSource.id && !error) return;
    setActiveSource(source);
    setLoading(true);
    setError(false);
    setRetry(k => k + 1);
  }, [activeSource.id, error]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    setRetry(k => k + 1);
  }, []);

  const toggleFs = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  const revealControls = useCallback(() => {
    setShowCtl(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowCtl(false), 2500);
  }, []);

  const fetchSources = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/stream-sources');
      if (res.ok) {
        const data = await res.json();
        if (data.sources?.length) {
          setSources(data.sources);
          const live = data.sources.find((s: Source) => s.verified) || data.sources[0];
          if (!apiLoaded) {
            setActiveSource(live);
          }
        }
      }
    } catch {
    } finally {
      setApiLoaded(true);
      setRefreshing(false);
    }
  }, [apiLoaded]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFs(); }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reload(); }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); setTheater(t => !t); }
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= sources.length && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        changeSource(sources[num - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFs, reload, sources, changeSource]);

  useEffect(() => {
    const handler = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setError(true), LOAD_TIMEOUT);
    return () => clearTimeout(t);
  }, [loading, retry]);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden select-none">
      <header className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/60 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">LIVE</span>
          </span>
          <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono border border-zinc-700/50">F</kbd>
        </div>
      </header>

      <div
        className="flex flex-col transition-all duration-500 ease-in-out"
        style={{ height: 'calc(100dvh - 45px)' }}
      >
        <div className={`flex flex-1 min-h-0 ${theater ? '' : 'lg:flex-row'}`}>
          <div
            ref={playerRef}
            className="relative bg-black flex-1 flex flex-col min-h-0"
            onMouseMove={revealControls}
            onMouseLeave={() => setShowCtl(false)}
            onClick={() => setShowCtl(p => !p)}
          >
            <div className="relative flex-1 min-h-0">
              {loading && !error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900">
                  <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-zinc-800 rounded-full" />
                      <div className="absolute inset-0 w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-zinc-300 font-medium">Loading stream</p>
                      <p className="text-xs text-zinc-600">{activeSource.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900">
                  <div className="flex flex-col items-center gap-5 text-center px-6 max-w-xs">
                    <div className="w-14 h-14 rounded-full bg-red-600/15 flex items-center justify-center">
                      <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300 font-medium mb-1">Stream unavailable</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {activeSource.verified
                          ? 'The connection timed out. This could be a network issue or the source may be down.'
                          : `${activeSource.name} didn't respond. The site may not support embedding. Try another source or open it directly.`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={reload}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry
                      </button>
                      {!activeSource.verified && (
                        <a
                          href={activeSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <iframe
                key={`${activeSource.id}-${retry}`}
                src={activeSource.url}
                className={`w-full h-full border-0 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
                allowFullScreen
                onLoad={() => { setLoading(false); setError(false); }}
              />

              <div
                className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-16 pb-2.5 px-3 transition-opacity duration-300 ${
                  showCtl && !loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-1">
                  <button onClick={reload} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Reload stream (R)">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setTheater(t => !t)}
                    className={`p-2 rounded-lg transition-colors ${theater ? 'bg-white/15 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                    title={theater ? 'Exit theater mode (T)' : 'Theater mode (T)'}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button onClick={toggleFs} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={fs ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {fs ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!theater && (
            <div className="w-full lg:w-[420px] lg:min-w-[320px] border-l border-zinc-800/60 bg-zinc-950/80 flex flex-col shrink-0">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">Live Chat</span>
              </div>
              <div className="flex-1 min-h-0">
                <iframe src={CHAT_SRC} className="w-full h-full border-0 min-h-[400px] lg:min-h-0" allow="clipboard-write" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border-t border-zinc-800/40"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div ref={sourceScroller} className="flex-1 flex items-center gap-1.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sources.map((source, i) => (
              <button
                key={source.id}
                onClick={() => changeSource(source)}
                disabled={source.id === activeSource.id && !error}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  source.id === activeSource.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : source.verified
                      ? 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 hover:text-white'
                      : 'bg-zinc-800/30 text-zinc-500 hover:bg-zinc-700/40 hover:text-zinc-300'
                }`}
                title={source.error || (source.verified ? `${source.name} - Verified` : `${source.name} - Unverified`)}
              >
                <span className="flex items-center justify-center w-4 h-4 rounded bg-black/20 text-[10px] font-bold">
                  {i + 1}
                </span>
                <span>{source.name}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    source.id === activeSource.id
                      ? 'bg-white animate-pulse'
                      : source.verified
                        ? 'bg-green-500'
                        : 'bg-zinc-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            onClick={fetchSources}
            disabled={refreshing}
            className="shrink-0 p-2 rounded-lg bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200 transition-colors disabled:opacity-50"
            title="Refresh sources"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
