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

  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const originalOpen = window.open;
    window.open = function () { return null; };
    return () => { window.open = originalOpen; };
  }, []);

  const changeSource = useCallback((source: Source) => {
    if (activeSource && source.id === activeSource.id && !error) return;
    setActiveSource(source);
    setLoading(true);
    setError(false);
    setRetry(k => k + 1);
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
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">LIVE</span>
        </div>
      </header>

      <div className="flex flex-col" style={{ height: 'calc(100dvh - 45px)' }}>
        {!activeSource && !apiLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">Discovering stream sources</p>
            </div>
          </div>
        ) : !activeSource && apiLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            <div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300 font-medium">No stream sources available</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Run the scraper first, or use the refresh button below to discover sources.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 lg:flex-row">
            <div className="relative bg-black flex-1">
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
                          ? 'The connection timed out. This could be a network issue or the source may be down.'
                          : `${activeSource!.name} didn't respond. The site may not support embedding. Try another source or open it directly.`}
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
                key={`${activeSource!.id}-${retry}`}
                src={activeSource!.url}
                className={`w-full h-full border-0 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
                allowFullScreen
                onLoad={() => { setLoading(false); setError(false); }}
              />
            </div>

            <div className="w-full lg:w-[420px] lg:min-w-[320px] border-l border-zinc-800/60 bg-zinc-950/80 flex flex-col shrink-0">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">Live Chat</span>
              </div>
              <div className="flex-1 min-h-0">
                <iframe src={CHAT_SRC} className="w-full h-full border-0 min-h-[400px] lg:min-h-0" allow="clipboard-write" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border-t border-zinc-800/40"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div ref={sourceScroller} className="flex-1 flex items-center gap-1.5 overflow-x-auto"
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
