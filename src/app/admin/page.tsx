'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Stream {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_live: number;
  username: string;
  created_at: string;
}

export default function AdminPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [user, setUser] = useState<{ id: number; username: string; is_admin: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || !d.user.is_admin) {
          router.push('/');
          return;
        }
        setUser(d.user);
        return fetchStreams();
      })
      .catch(() => router.push('/'));
  }, []);

  const fetchStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    if (data.streams) setStreams(data.streams);
    setLoading(false);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, video_url: videoUrl, thumbnail_url: thumbnailUrl, is_live: isLive ? 1 : 0 }),
    });
    const data = await res.json();
    if (data.success) {
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setIsLive(false);
      setShowAdd(false);
      fetchStreams();
    } else {
      setError(data.error || 'Failed to add stream');
    }
  };

  const toggleLive = async (id: number, current: number) => {
    await fetch(`/api/streams`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_live: current ? 0 : 1 }),
    });
    fetchStreams();
  };

  const deleteStream = async (id: number) => {
    await fetch(`/api/streams`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchStreams();
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" /></div>;
  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ufc-red/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold uppercase tracking-wider">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Manage live streams</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-sm uppercase tracking-wider font-semibold">Manage Streams</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30"
          >
            {showAdd ? 'Cancel' : '+ Add Stream'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 card-hover">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Stream title" required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Video URL</label>
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube/Vimeo/MP4 URL" required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Thumbnail URL</label>
                <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Optional thumbnail" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-gray-300 text-sm bg-white/[0.03] rounded-xl px-4 py-3">
              <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="accent-ufc-red w-4 h-4" />
              <span className="text-xs">Mark as Live</span>
            </label>
            {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="bg-ufc-red text-white px-6 py-2.5 text-sm uppercase font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30">Add Stream</button>
          </form>
        )}

        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-gray-800/50">
                  <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Title</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Created By</th>
                  <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-right px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {streams.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-white text-xs font-medium">{s.title}</td>
                    <td className="px-5 py-4">
                      {s.is_live ? (
                        <span className="live-badge bg-ufc-red/10 text-ufc-red text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">LIVE</span>
                      ) : (
                        <span className="bg-white/5 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full uppercase">Offline</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{s.username}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => toggleLive(s.id, s.is_live)} className={`text-xs mr-3 px-3 py-1 rounded-full transition ${
                        s.is_live ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                      }`}>
                        {s.is_live ? 'Go Offline' : 'Go Live'}
                      </button>
                      <button onClick={() => deleteStream(s.id)} className="text-red-400 text-xs px-3 py-1 rounded-full bg-red-400/10 hover:bg-red-400/20 transition">Delete</button>
                    </td>
                  </tr>
                ))}
                {streams.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">No streams yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
