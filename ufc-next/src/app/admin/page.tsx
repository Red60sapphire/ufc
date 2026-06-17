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
      })
      .catch(() => router.push('/'));

    fetchStreams();
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

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="bg-gradient-to-r from-purple-900/30 to-transparent py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-white text-xl font-bold uppercase tracking-wider">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage live streams</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-sm uppercase tracking-wider font-semibold">Manage Streams</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-ufc-red text-white px-4 py-1.5 text-xs uppercase font-semibold rounded hover:bg-red-700 transition"
          >
            {showAdd ? 'Cancel' : '+ Add Stream'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-[#111] border border-gray-800 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red" />
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (YouTube/Vimeo/MP4)" required className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red" />
              <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL" className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red" />
            </div>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="accent-ufc-red" />
              Mark as Live
            </label>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="bg-ufc-red text-white px-6 py-2 text-sm uppercase font-semibold rounded hover:bg-red-700 transition">Add Stream</button>
          </form>
        )}

        <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">Created By</th>
                <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {streams.map((s) => (
                <tr key={s.id} className="hover:bg-[#1a1a1a] transition">
                  <td className="px-4 py-3 text-white text-xs font-medium">{s.title}</td>
                  <td className="px-4 py-3">
                    {s.is_live ? (
                      <span className="live-badge bg-ufc-red text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">LIVE</span>
                    ) : (
                      <span className="bg-gray-700 text-gray-400 text-[10px] px-2 py-0.5 rounded uppercase">Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.username}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleLive(s.id, s.is_live)} className={`text-xs mr-3 ${s.is_live ? 'text-yellow-400' : 'text-green-400'} hover:underline`}>
                      {s.is_live ? 'Go Offline' : 'Go Live'}
                    </button>
                    <button onClick={() => deleteStream(s.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {streams.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">No streams yet. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
