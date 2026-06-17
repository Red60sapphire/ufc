'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHls, setIsHls] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const isHlsStream = src.includes('.m3u8') || src.includes('/play/clip/') || src.includes('/play/file/') || src.includes('/play/seg');
    setIsHls(isHlsStream);

    if (isHlsStream) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = () => {
        if ((window as any).Hls && videoRef.current) {
          const hls = new (window as any).Hls();
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
          hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
            setLoaded(true);
            videoRef.current?.play().catch(() => {});
          });
        }
      };
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [src]);

  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

  if (isYouTube) {
    const videoId = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
    if (!videoId) return <div className="text-gray-500 text-xs p-4">Invalid YouTube URL</div>;
    return (
      <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isHls) {
    return (
      <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <video ref={videoRef} poster={poster} className="w-full h-full" controls playsInline />
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-8 h-8 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span className="text-xs">Failed to load video</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full"
          controls
          playsInline
          preload="metadata"
          onError={() => setError(true)}
          onCanPlay={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
