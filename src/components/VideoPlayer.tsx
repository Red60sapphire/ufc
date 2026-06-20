'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const hlsRef = useRef<any>(null);

  const needsProxy = src && !src.includes('/api/video-proxy') && (src.includes('mmareplayfull.com') || src.includes('portal.portalmma.cc'));
  const proxiedUrl = needsProxy ? src.replace('mmareplayfull.com', 'api.mmareplayfull.com') : src;
  const videoSrc = needsProxy ? `/api/video-proxy?url=${encodeURIComponent(proxiedUrl)}` : src;

  const isHls = !!(videoSrc && (videoSrc.includes('.m3u8') || videoSrc.includes('/play/clip/') || videoSrc.includes('/play/file/') || videoSrc.includes('/play/seg') || videoSrc.includes('/api/video-proxy')));

  const initHls = useCallback(() => {
    if (!videoSrc || !videoRef.current) return;
    setError(false);
    setLoaded(false);

    if ((window as any).Hls && (window as any).Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new (window as any).Hls();
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(videoRef.current);
      hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
        setLoaded(true);
        videoRef.current?.play().catch(() => {});
      });
      hls.on((window as any).Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          setError(true);
        }
      });
    } else {
      setError(true);
    }
  }, [videoSrc]);

  useEffect(() => {
    if (!isHls || !videoSrc) return;

    hlsRef.current = null;

    if ((window as any).Hls) {
      initHls();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = initHls;
      script.onerror = () => setError(true);
      document.body.appendChild(script);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isHls, videoSrc, initHls, retryKey]);

  const handleRetry = () => {
    setRetryKey(k => k + 1);
  };

  const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');

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

  const errorOverlay = (msg?: string) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 bg-black/80">
      <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      <span className="text-xs text-gray-500">{msg || 'Failed to load video'}</span>
      <button
        onClick={handleRetry}
        className="mt-1 px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold bg-ufc-red/10 text-ufc-red border border-ufc-red/30 rounded-full hover:bg-ufc-red/20 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  if (isHls) {
    return (
      <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <video ref={videoRef} poster={poster} className="w-full h-full" controls playsInline />
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-8 h-8 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && errorOverlay()}
      </div>
    );
  }

  if (!videoSrc) {
    return (
      <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">No video source</div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
      {error ? (
        errorOverlay()
      ) : (
        <video
          key={retryKey}
          ref={videoRef}
          src={videoSrc}
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
