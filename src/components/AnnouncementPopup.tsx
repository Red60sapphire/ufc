'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  message: string;
  created_by: number;
  created_at: string;
  expires_at: string | null;
  is_active: number;
  dismissible: number;
  persistent: number;
  duration_minutes: number | null;
  username?: string;
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        if (data.announcements?.length > 0) {
          const ann = data.announcements[0];
          if (ann.expires_at && new Date(ann.expires_at) < new Date()) return;
          const key = `announcement_dismissed_${ann.id}`;
          if (localStorage.getItem(key) === '1' && !ann.persistent) return;
          setAnnouncement(ann);
          setTimeout(() => setVisible(true), 500);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      const key = `announcement_dismissed_${announcement.id}`;
      localStorage.setItem(key, '1');
    }
    setVisible(false);
    setTimeout(() => setAnnouncement(null), 300);
  };

  if (!announcement) return null;

  const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
  if (isExpired) return null;

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={announcement.dismissible ? handleDismiss : undefined} />
          <div className={`relative max-w-lg w-full bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in ${!announcement.dismissible ? 'pointer-events-none' : ''}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ufc-red via-ufc-gold to-ufc-red" />
            {announcement.title && (
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-ufc-red rounded-full animate-pulse" />
                  <span className="text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold">Announcement</span>
                </div>
                <h3 className="text-white text-lg font-bold">{announcement.title}</h3>
              </div>
            )}
            <div className="px-6 py-4">
              <p className="text-gray-300 text-sm leading-relaxed">{announcement.message}</p>
              {announcement.expires_at && (
                <p className="text-gray-600 text-[10px] mt-3">
                  Expires {new Date(announcement.expires_at).toLocaleString()}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-800/50 flex items-center justify-between">
              <span className="text-gray-600 text-[10px]">{announcement.username ? `by ${announcement.username}` : ''}</span>
              {announcement.dismissible ? (
                <button onClick={handleDismiss} className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
                  Dismiss
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
