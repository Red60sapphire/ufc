'use client';

import { useEffect } from "react";
import Link from "next/link";

export default function WatchPage() {
  useEffect(() => {
    const originalOpen = window.open;
    window.open = function () {
      console.warn("Blocked popup");
      return null;
    };
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.open = originalOpen;
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="bg-red-600 text-center py-3 font-semibold text-sm flex items-center justify-center gap-3">
        <span>UFC Solutions is currently undergoing maintenance. Live coverage remains available below.</span>
        <Link href="/" className="text-white/70 hover:text-white text-xs underline transition">Back to Home</Link>
      </div>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-48px)]">
        <div className="flex-1 bg-black">
          <iframe
            src="https://soccerball.st/rampages/unoairuf/"
            className="w-full h-full border-0"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-fullscreen"
          />
        </div>
        <div className="w-full lg:w-[420px] border-l border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-300">Live Chat</span>
            </div>
          </div>
          <div className="flex-1">
            <iframe
              src="https://www.youtube.com/live_chat?v=RlrRro00XYY&embed_domain=www.ufc.solutions"
              className="w-full h-full border-0 min-h-[500px] lg:min-h-0"
              allow="clipboard-write"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
