'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Stats {
  users: number;
  streams: number;
  liveStreams: number;
  messages: number;
}

interface RecentUser {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
}

interface RecentMessage {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

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

interface Replay {
  id: number;
  fighter1: string;
  fighter2: string;
  fighter1_img: string | null;
  fighter2_img: string | null;
  event: string | null;
  video_url: string;
  created_at: string;
}

type Tab = 'dashboard' | 'streams' | 'replays' | 'users' | 'chatlog';

export default function AdminDashboard({ user }: { user: { id: number; username: string; is_admin: number } }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [allMessages, setAllMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/streams').then(r => r.json()),
      fetch('/api/replays').then(r => r.json()),
    ]).then(([statsData, streamsData, replaysData]) => {
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.recentUsers) setRecentUsers(statsData.recentUsers);
      if (statsData.recentMessages) {
        setRecentMessages(statsData.recentMessages);
        setAllMessages(statsData.recentMessages);
      }
      if (streamsData.streams) setStreams(streamsData.streams);
      if (replaysData.replays) setReplays(replaysData.replays);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-xs uppercase tracking-wider">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'streams', label: 'Streams', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { key: 'replays', label: 'Replays', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
    { key: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { key: 'chatlog', label: 'Chat Log', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ufc-red/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <svg className="w-6 h-6 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold uppercase tracking-wider">Admin Panel</h1>
              <p className="text-gray-500 text-sm">Welcome back, {user.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white/[0.03] border border-gray-800/50 rounded-2xl p-1 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase font-semibold rounded-xl transition-all whitespace-nowrap ${tab === t.key ? 'bg-ufc-red text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <DashboardTab stats={stats!} recentUsers={recentUsers} recentMessages={recentMessages} />}
        {tab === 'streams' && <StreamsTab streams={streams} onRefresh={() => fetch('/api/streams').then(r => r.json()).then(d => { if (d.streams) setStreams(d.streams); })} />}
        {tab === 'replays' && <ReplaysTab replays={replays} onRefresh={() => fetch('/api/replays').then(r => r.json()).then(d => { if (d.replays) setReplays(d.replays); })} />}
        {tab === 'users' && <UsersTab users={recentUsers} />}
        {tab === 'chatlog' && <ChatLogTab messages={allMessages} />}
      </div>
    </div>
  );
}

function DashboardTab({ stats, recentUsers, recentMessages }: { stats: Stats; recentUsers: RecentUser[]; recentMessages: RecentMessage[] }) {
  const cards = [
    { label: 'Total Users', value: stats.users, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
    { label: 'Streams', value: stats.streams, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400' },
    { label: 'Live Now', value: stats.liveStreams, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'from-ufc-red/20 to-ufc-red/5 border-ufc-red/30 text-ufc-red' },
    { label: 'Chat Messages', value: stats.messages, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-2xl p-5 card-hover`}>
            <div className="flex items-center justify-between mb-3">
              <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} /></svg>
            </div>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-xs opacity-60 uppercase tracking-wider mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h3 className="text-white text-xs uppercase tracking-wider font-semibold">Recent Users</h3>
          </div>
          <div className="p-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-ufc-red/20 flex items-center justify-center text-ufc-red text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-white text-xs font-medium">{u.username}</p>
                    <p className="text-gray-600 text-[10px]">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {u.is_admin ? <span className="text-[9px] bg-ufc-red/10 text-ufc-red px-2 py-0.5 rounded-full font-semibold">ADMIN</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h3 className="text-white text-xs uppercase tracking-wider font-semibold">Recent Messages</h3>
          </div>
          <div className="p-2 max-h-[320px] overflow-y-auto">
            {recentMessages.map(m => (
              <div key={m.id} className="px-3 py-2.5 rounded-xl hover:bg-white/5 transition">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-ufc-red text-[10px] font-semibold">{m.username}</span>
                  <span className="text-gray-600 text-[9px]">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-400 text-xs truncate">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamsTab({ streams, onRefresh }: { streams: Stream[]; onRefresh: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

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
      setTitle(''); setDescription(''); setVideoUrl(''); setThumbnailUrl(''); setIsLive(false);
      setShowAdd(false);
      onRefresh();
    } else {
      setError(data.error || 'Failed to add stream');
    }
  };

  const toggleLive = async (id: number, current: number) => {
    await fetch('/api/streams', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_live: current ? 0 : 1 }),
    });
    onRefresh();
  };

  const deleteStream = async (id: number) => {
    await fetch('/api/streams', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-sm uppercase tracking-wider font-semibold">Manage Streams ({streams.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
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
                    <button onClick={() => toggleLive(s.id, s.is_live)} className={`text-xs mr-2 px-3 py-1 rounded-full transition ${
                      s.is_live ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                    }`}>
                      {s.is_live ? 'Offline' : 'Live'}
                    </button>
                    <button onClick={() => deleteStream(s.id)} className="text-red-400 text-xs px-3 py-1 rounded-full bg-red-400/10 hover:bg-red-400/20 transition">Delete</button>
                  </td>
                </tr>
              ))}
              {streams.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">No streams yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReplaysTab({ replays, onRefresh }: { replays: Replay[]; onRefresh: () => void }) {
  const [fighter1, setFighter1] = useState('');
  const [fighter2, setFighter2] = useState('');
  const [fighter1Img, setFighter1Img] = useState('');
  const [fighter2Img, setFighter2Img] = useState('');
  const [event, setEvent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/replays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fighter1, fighter2, fighter1_img: fighter1Img, fighter2_img: fighter2Img, event, video_url: videoUrl }),
    });
    const data = await res.json();
    if (data.success) {
      setFighter1(''); setFighter2(''); setFighter1Img(''); setFighter2Img(''); setEvent(''); setVideoUrl('');
      setShowAdd(false);
      onRefresh();
    } else {
      setError(data.error || 'Failed to add replay');
    }
  };

  const deleteReplay = async (id: number) => {
    await fetch('/api/replays', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-sm uppercase tracking-wider font-semibold">Manage Replays ({replays.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
          {showAdd ? 'Cancel' : '+ Add Replay'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 card-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Fighter 1</label>
              <input value={fighter1} onChange={(e) => setFighter1(e.target.value)} placeholder="e.g. Israel Adesanya" required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Fighter 2</label>
              <input value={fighter2} onChange={(e) => setFighter2(e.target.value)} placeholder="e.g. Jared Cannonier" required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Fighter 1 Image URL</label>
              <input value={fighter1Img} onChange={(e) => setFighter1Img(e.target.value)} placeholder="ESPN headshot URL" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Fighter 2 Image URL</label>
              <input value={fighter2Img} onChange={(e) => setFighter2Img(e.target.value)} placeholder="ESPN headshot URL" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Event Name</label>
              <input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="e.g. UFC 300" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Video URL</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="MP4/YouTube URL" required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="bg-ufc-red text-white px-6 py-2.5 text-sm uppercase font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30">Add Replay</button>
        </form>
      )}

      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-gray-800/50">
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Fight</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Event</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Date Added</th>
                <th className="text-right px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {replays.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-medium">{r.fighter1}</span>
                      <span className="text-ufc-red text-[10px] font-bold">VS</span>
                      <span className="text-white text-xs font-medium">{r.fighter2}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{r.event || '-'}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => deleteReplay(r.id)} className="text-red-400 text-xs px-3 py-1 rounded-full bg-red-400/10 hover:bg-red-400/20 transition">Delete</button>
                  </td>
                </tr>
              ))}
              {replays.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500 text-sm">No replays yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: RecentUser[] }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800/50">
        <h3 className="text-white text-xs uppercase tracking-wider font-semibold">All Users ({users.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-gray-800/50">
              <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">User</th>
              <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Role</th>
              <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-ufc-red/20 flex items-center justify-center text-ufc-red text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                    <span className="text-white text-xs font-medium">{u.username}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {u.is_admin ? (
                    <span className="text-[9px] bg-ufc-red/10 text-ufc-red px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
                  ) : (
                    <span className="text-[9px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">USER</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChatLogTab({ messages }: { messages: RecentMessage[] }) {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800/50">
        <h3 className="text-white text-xs uppercase tracking-wider font-semibold">Recent Chat Messages ({messages.length})</h3>
      </div>
      <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
        {messages.map(m => (
          <div key={m.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-ufc-red text-[10px] font-semibold">{m.username}</span>
              <span className="text-gray-600 text-[9px]">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-gray-600 text-[9px] ml-auto">#{m.id}</span>
            </div>
            <p className="text-gray-300 text-xs">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-500 text-sm">No messages yet</div>
        )}
      </div>
    </div>
  );
}
