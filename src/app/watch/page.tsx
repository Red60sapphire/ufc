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

const CHAT_SRC = 'https://www.youtube.com/live_chat?v=RlrRro00XYY&embed_domain=www.ufc.solutions';
const LOAD_TIMEOUT = 20000;

export default function WatchPage() {
  const sourceScroller = useRef<HTMLDivElement>(null);
  const clickShield = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const trustedUrlRef = useRef<string>('');

  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [shieldActive, setShieldActive] = useState(true);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);

  useEffect(() => {
    setChatOpen(window.innerWidth >= 1024);
  }, []);

  useEffect(() => {
    const originalOpen = window.open;
    window.open = () => null;
    return () => { window.open = originalOpen; };
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => window.focus(), 10);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[class*="popup"], [class*="overlay"], [id*="popup"], [id*="overlay"], .ads, [class*="ad-"]').forEach(el => {
        if (!document.body.contains(el)) return;
        const parent = el.closest('[class*="popup"], [class*="overlay"], [id*="popup"], [id*="overlay"], .ads, [class*="ad-"]') || el;
        if (parent && parent !== document.body && parent !== document.documentElement) {
          parent.remove();
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !activeSource) return;
    trustedUrlRef.current = activeSource.url;
    const interval = setInterval(() => {
      try {
        if (iframeRef.current && !iframeRef.current.src.includes(new URL(trustedUrlRef.current).hostname)) {
          iframeRef.current.src = trustedUrlRef.current;
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSource]);

  const dismissShield = useCallback(() => {
    setShieldActive(false);
  }, []);

  const changeSource = useCallback((source: Source) => {
    if (activeSource && source.id === activeSource.id && !error) return;
    setActiveSource(source);
    setLoading(true);
    setError(false);
    setShieldActive(true);
    setRetry(k => k + 1);
    setSourceSheetOpen(false);
  }, [activeSource?.id, error]);

  const fetchSources = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/stream-sources');
      if (res.ok) {
        const data = await res.json();
        if (data.sources?.length) {
          setSources(data.sources);
          if (!apiLoaded) {
            const first = data.sources.find((s: Source) => s.verified) || data.sources[0];
            setActiveSource(first);
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
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= sources.length && !e.ctrlKey && !e.metaKey && sources.length > 0) {
        e.preventDefault();
        changeSource(sources[num - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sources, changeSource]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setError(true), LOAD_TIMEOUT);
    return () => clearTimeout(t);
  }, [loading, retry]);

  const activeSourceIndex = sources.findIndex(s => s.id === activeSource?.id);
  const prevSource = activeSourceIndex > 0 ? sources[activeSourceIndex - 1] : null;
  const nextSource = activeSourceIndex < sources.length - 1 ? sources[activeSourceIndex + 1] : null;

  return (
    <main className="min-h-dvh bg-black text-white overflow-hidden select-none">
      <header className="flex items-center justify-between px-3 py-2.5 bg-zinc-900/80 border-b border-zinc-800/50">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-600/20">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">Live</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col" style={{ height: 'calc(100dvh - 45px)' }}>
        {!activeSource && !apiLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-900/50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">Finding streams</p>
            </div>
          </div>
        ) : !activeSource && apiLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-900/50">
            <div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300 font-medium">No streams available</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Run the scraper first, or tap refresh below.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 lg:flex-row">
            <div className="relative bg-black flex-1 flex flex-col">
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
                        <p className="text-xs text-zinc-600">{activeSource!.name}</p>
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
                          {activeSource!.verified
                            ? 'Connection timed out. The source may be down.'
                            : `${activeSource!.name} didn't respond. Try another source.`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setLoading(true); setError(false); setRetry(k => k + 1); }}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry
                        </button>
                        {!activeSource!.verified && (
                          <a
                            href={activeSource!.url}
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
                  ref={iframeRef}
                  key={`${activeSource!.id}-${retry}`}
                  src={activeSource!.url}
                  className={`w-full h-full border-0 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
                  allow="fullscreen"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  onLoad={() => { setLoading(false); setError(false); }}
                />

                {shieldActive && !error && (
                  <div
                    ref={clickShield}
                    onClick={dismissShield}
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity"
                  >
                    <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/60">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <p className="text-sm text-zinc-300 font-medium">Tap to interact</p>
                      <p className="text-xs text-zinc-500 text-center">One tap needed to enable controls</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800/30">
                <div className="flex items-center gap-1">
                  {prevSource && (
                    <button
                      onClick={() => changeSource(prevSource)}
                      className="px-3 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {prevSource.name}
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-zinc-600 font-medium">{activeSource!.name}</span>
                <div className="flex items-center gap-1">
                  {nextSource && (
                    <button
                      onClick={() => changeSource(nextSource)}
                      className="px-3 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      {nextSource.name}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setChatOpen(c => !c)}
              className={`lg:hidden fixed bottom-20 right-4 z-30 w-11 h-11 rounded-full bg-red-600 shadow-lg shadow-red-600/30 flex items-center justify-center active:scale-90 transition-transform duration-200 ${chatOpen ? 'hidden' : 'flex'}`}
              aria-label="Open chat"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {chatOpen && (
              <div
                onClick={() => setChatOpen(false)}
                className="lg:hidden fixed inset-0 z-10 bg-black/60 animate-in fade-in duration-200"
              />
            )}

            <div
              className={`${chatOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-out lg:static fixed inset-y-0 right-0 z-20 lg:z-auto flex w-full lg:w-[420px] lg:min-w-[320px] border-l border-zinc-800/60 bg-zinc-950/80 flex-col shrink-0`}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">Live Chat</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <iframe
                  src={CHAT_SRC}
                  className="w-full h-full border-0 min-h-[400px] lg:min-h-0"
                  allow="fullscreen"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-2 py-2 bg-zinc-900/80 border-t border-zinc-800/40">
          <div className="flex-1 lg:hidden">
            <button
              onClick={() => setSourceSheetOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 text-zinc-300 active:bg-zinc-700/60 transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {activeSource ? activeSource.name : 'Select source'}
              <span className="text-zinc-600">({sources.length})</span>
            </button>
          </div>

          <div ref={sourceScroller} className="hidden lg:flex flex-1 items-center gap-1.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sources.map((source, i) => (
              <button
                key={source.id}
                onClick={() => changeSource(source)}
                disabled={source.id === activeSource?.id && !error}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  source.id === activeSource?.id
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
                    source.id === activeSource?.id
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
            className="shrink-0 p-2 rounded-lg bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200 transition-colors disabled:opacity-50 active:scale-95"
            title="Refresh sources"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {sourceSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setSourceSheetOpen(false)}
            className="absolute inset-0 bg-black/60 animate-in fade-in duration-200"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800/60 rounded-t-2xl animate-in slide-in-from-bottom duration-300 ease-out">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
              <h2 className="text-sm font-semibold text-zinc-200">Stream Sources</h2>
              <button
                onClick={() => setSourceSheetOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3 space-y-1">
              {sources.map((source, i) => {
                const isActive = source.id === activeSource?.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => changeSource(source)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-red-600/10 border border-red-600/20'
                        : 'hover:bg-zinc-800/60 border border-transparent'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                      isActive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {source.name}
                        </span>
                        {source.verified && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-600/10 text-green-400 border border-green-600/20 shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                      {source.error && (
                        <p className="text-xs text-zinc-600 mt-0.5 truncate">{source.error}</p>
                      )}
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-zinc-800/50">
              <p className="text-[10px] text-zinc-600 text-center">
                Keyboard shortcuts: 1-{Math.min(sources.length, 9)} to switch
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
