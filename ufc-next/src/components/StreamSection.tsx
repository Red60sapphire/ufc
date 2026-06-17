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
      {streams.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStream(s)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs uppercase tracking-wider rounded transition ${
                activeStream?.id === s.id ? 'bg-ufc-red text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.is_live ? '🔴 ' : ''}{s.title}
            </button>
          ))}
        </div>
      )}

      {activeStream && (
        <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
          <div className="aspect-video bg-black">
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
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {activeStream.is_live ? (
                <span className="live-badge bg-ufc-red text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Live</span>
              ) : (
                <span className="bg-gray-700 text-gray-400 text-[10px] px-2 py-0.5 rounded uppercase">Offline</span>
              )}
              <h3 className="text-white text-sm font-bold">{activeStream.title}</h3>
            </div>
            {activeStream.description && (
              <p className="text-gray-400 text-xs">{activeStream.description}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">Stream by {activeStream.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
