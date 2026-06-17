'use client';

import { useState } from 'react';

interface Stream {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_live: number;
  username: string;
}

export default function StreamSection({ streams }: { streams: Stream[] }) {
  const [activeStream, setActiveStream] = useState<Stream | null>(streams[0] || null);

  if (streams.length === 0) return null;

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const v = url.split('v=')[1]?.split('&')[0];
      return v ? `https://www.youtube.com/embed/${v}` : url;
    }
    if (url.includes('youtu.be/')) {
      const v = url.split('youtu.be/')[1]?.split('?')[0];
      return v ? `https://www.youtube.com/embed/${v}` : url;
    }
    if (url.includes('vimeo.com')) {
      const v = url.split('vimeo.com/')[1]?.split('/')[0];
      return v ? `https://player.vimeo.com/video/${v}` : url;
    }
    return url;
  };

  const isEmbed = (url: string) =>
    url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-4 w-1 bg-ufc-red rounded-full" />
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Live Streams</h2>
        {activeStream?.is_live ? (
          <span className="live-badge bg-ufc-red text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">LIVE</span>
        ) : null}
      </div>

      {streams.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStream(s)}
              className={`flex-shrink-0 px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all duration-300 ${
                activeStream?.id === s.id
                  ? 'bg-ufc-red text-white shadow-lg shadow-red-900/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-800'
              }`}
            >
              {s.is_live && <span className="mr-1.5 inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              {s.title}
            </button>
          ))}
        </div>
      )}

      {activeStream && (
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover">
          <div className="relative aspect-video bg-black">
            {isEmbed(activeStream.video_url) ? (
              <iframe
                src={getEmbedUrl(activeStream.video_url)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={activeStream.video_url}
                className="w-full h-full"
                controls
                poster={activeStream.thumbnail_url || undefined}
              />
            )}
            {activeStream.is_live && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-base font-bold">{activeStream.title}</h3>
                {activeStream.description && (
                  <p className="text-gray-400 text-xs mt-1">{activeStream.description}</p>
                )}
              </div>
              {activeStream.is_live ? (
                <span className="live-badge bg-ufc-red text-white text-[10px] px-2.5 py-1 rounded-full uppercase font-bold flex-shrink-0 ml-3">Live</span>
              ) : (
                <span className="bg-gray-700 text-gray-400 text-[10px] px-2.5 py-1 rounded-full uppercase flex-shrink-0 ml-3">Offline</span>
              )}
            </div>
            <p className="text-gray-600 text-[10px] mt-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Stream by {activeStream.username}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
