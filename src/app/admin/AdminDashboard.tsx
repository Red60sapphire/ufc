'use client';

import { useState, useEffect, FormEvent } from 'react';
import VideoUploader from '@/components/VideoUploader';

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
  title: string | null;
  slug: string | null;
  promotion: string;
  event_name: string | null;
  fighter1: string;
  fighter2: string;
  fighter1_img: string | null;
  fighter2_img: string | null;
  weight_class: string | null;
  result: string | null;
  duration: string | null;
  description: string | null;
  thumbnail: string | null;
  video_url: string;
  event_date: string | null;
  featured: number;
  published: number;
  views: number;
  created_at: string;
}

type Tab = 'dashboard' | 'streams' | 'replays' | 'users' | 'chatlog' | 'announcements';

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
    fetch('/api/init').catch(() => {});
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
    { key: 'announcements', label: 'Announcements', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
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
        {tab === 'announcements' && <AnnouncementsTab />}
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

  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshUFC = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/refresh-ufc', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Cache cleared');
    } catch (err) {
      alert('Failed to refresh');
    }
    setRefreshing(false);
  };

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

      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5 card-hover">
        <h3 className="text-white text-xs uppercase tracking-wider font-semibold mb-4">UFC Data Cache</h3>
        <button
          onClick={handleRefreshUFC}
          disabled={refreshing}
          className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2.5 text-xs uppercase font-semibold rounded-xl hover:bg-blue-600/30 transition disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh UFC Data (Clear Cache)'}
        </button>
        <p className="text-gray-500 text-[10px] mt-2">Clears ESPN API cache and forces fresh data on next page load</p>
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
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');


  const blank = { title: '', slug: '', promotion: 'UFC', event_name: '', fighter1: '', fighter2: '', fighter1_img: '', fighter2_img: '', weight_class: '', result: '', duration: '', description: '', thumbnail: '', video_url: '', event_date: '', featured: false, published: true };
  const [form, setForm] = useState(blank);

  const filtered = search ? replays.filter(r =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    r.fighter1.toLowerCase().includes(search.toLowerCase()) ||
    r.fighter2.toLowerCase().includes(search.toLowerCase()) ||
    (r.event_name || '').toLowerCase().includes(search.toLowerCase()) ||
    r.promotion.toLowerCase().includes(search.toLowerCase())
  ) : replays;

  const resetForm = () => { setForm(blank); setError(''); setEditId(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const body = { ...form, slug };
    const method = editId ? 'PATCH' : 'POST';

    const res = await fetch('/api/replays', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { ...body, id: editId } : body),
    });
    const data = await res.json();
    if (data.success) { resetForm(); setShowAdd(false); onRefresh(); }
    else setError(data.error || 'Failed');
  };

  const toggleFeatured = async (id: number, current: number) => {
    await fetch('/api/replays', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, featured: current ? 0 : 1 }) });
    onRefresh();
  };

  const togglePublished = async (id: number, current: number) => {
    await fetch('/api/replays', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, published: current ? 0 : 1 }) });
    onRefresh();
  };

  const deleteReplay = async (id: number) => {
    await fetch('/api/replays', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    onRefresh();
  };

  const startEdit = (r: Replay) => {
    setForm({
      title: r.title || '', slug: r.slug || '', promotion: r.promotion || 'UFC', event_name: r.event_name || '',
      fighter1: r.fighter1, fighter2: r.fighter2, fighter1_img: r.fighter1_img || '', fighter2_img: r.fighter2_img || '',
      weight_class: r.weight_class || '', result: r.result || '', duration: r.duration || '', description: r.description || '',
      thumbnail: r.thumbnail || '', video_url: r.video_url, event_date: r.event_date || '', featured: !!r.featured, published: !!r.published,
    });
    setEditId(r.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const promotions = ['UFC', 'PFL', 'ONE Championship', 'Bellator', 'Boxing', 'Kickboxing'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search replays..." className="w-full bg-white/5 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-ufc-red/50" />
        </div>
        <button onClick={() => { resetForm(); setShowAdd(!showAdd); }} className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
          {showAdd ? 'Cancel' : '+ Add Replay'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 card-hover">
          <h3 className="text-white text-xs uppercase font-bold tracking-wider mb-2">{editId ? 'Edit Replay' : 'Add New Replay'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input label="Title" value={form.title} onChange={(v) => setForm({...form, title: v})} required />
            <Input label="Slug (auto)" value={form.slug} onChange={(v) => setForm({...form, slug: v})} placeholder="leave blank to auto-generate" />
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Promotion</label>
              <select value={form.promotion} onChange={(e) => setForm({...form, promotion: e.target.value})} className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-ufc-red/50">
                {promotions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Input label="Event Name" value={form.event_name} onChange={(v) => setForm({...form, event_name: v})} />
            <Input label="Fighter 1" value={form.fighter1} onChange={(v) => setForm({...form, fighter1: v})} required />
            <Input label="Fighter 2" value={form.fighter2} onChange={(v) => setForm({...form, fighter2: v})} required />
            <Input label="Fighter 1 Image URL" value={form.fighter1_img} onChange={(v) => setForm({...form, fighter1_img: v})} />
            <Input label="Fighter 2 Image URL" value={form.fighter2_img} onChange={(v) => setForm({...form, fighter2_img: v})} />
            <Input label="Thumbnail URL" value={form.thumbnail} onChange={(v) => setForm({...form, thumbnail: v})} placeholder="Landscape 16:9 image" />
            <div className="md:col-span-2 lg:col-span-3">
              <VideoUploader onUpload={(url) => setForm({...form, video_url: url})} currentUrl={form.video_url} />
              <div className="mt-2">
                <Input label="Or enter URL manually" value={form.video_url} onChange={(v) => setForm({...form, video_url: v})} placeholder="MP4 / HLS (.m3u8) / YouTube URL" />
              </div>
            </div>
            <Input label="Weight Class" value={form.weight_class} onChange={(v) => setForm({...form, weight_class: v})} />
            <Input label="Result" value={form.result} onChange={(v) => setForm({...form, result: v})} placeholder="e.g. KO Round 2" />
            <Input label="Duration" value={form.duration} onChange={(v) => setForm({...form, duration: v})} placeholder="e.g. 14:32" />
            <Input label="Event Date" value={form.event_date} onChange={(v) => setForm({...form, event_date: v})} type="date" />
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-300 text-xs bg-white/[0.03] rounded-xl px-4 py-3">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} className="accent-ufc-red w-4 h-4" />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-xs bg-white/[0.03] rounded-xl px-4 py-3">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({...form, published: e.target.checked})} className="accent-ufc-red w-4 h-4" />
              <span>Published</span>
            </label>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="bg-ufc-red text-white px-6 py-2.5 text-sm uppercase font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30">
            {editId ? 'Update Replay' : 'Add Replay'}
          </button>
        </form>
      )}

      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-gray-800/50">
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Title / Fight</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Promotion</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Views</th>
                <th className="text-right px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white text-xs font-medium truncate max-w-[200px]">{r.title || `${r.fighter1} vs ${r.fighter2}`}</p>
                    <p className="text-gray-600 text-[9px] truncate max-w-[200px]">{r.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-400 text-[10px]">{r.promotion || 'UFC'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {r.featured ? <span className="text-[9px] bg-ufc-red/10 text-ufc-red px-1.5 py-0.5 rounded font-semibold">F</span> : null}
                      {r.published ? (
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-semibold">PUB</span>
                      ) : (
                        <span className="text-[9px] bg-gray-500/10 text-gray-500 px-1.5 py-0.5 rounded">DRAFT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{r.views || 0}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => toggleFeatured(r.id, r.featured)} className={`text-[10px] mr-1.5 px-2 py-1 rounded-full transition ${r.featured ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-gray-500 bg-white/5 hover:text-yellow-400'}`} title="Toggle featured">★</button>
                    <button onClick={() => togglePublished(r.id, r.published)} className={`text-[10px] mr-1.5 px-2 py-1 rounded-full transition ${r.published ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20' : 'text-gray-500 bg-white/5 hover:text-green-400'}`} title="Toggle published">{r.published ? 'ON' : 'OFF'}</button>
                    <button onClick={() => startEdit(r)} className="text-blue-400 text-[10px] mr-1.5 px-2 py-1 rounded-full bg-blue-400/10 hover:bg-blue-400/20 transition">Edit</button>
                    <button onClick={() => deleteReplay(r.id)} className="text-red-400 text-[10px] px-2 py-1 rounded-full bg-red-400/10 hover:bg-red-400/20 transition">Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">{search ? 'No matching replays' : 'No replays yet'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} required={required} className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
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

function AnnouncementsTab() {
  interface AnnouncementItem { id: number; title: string; message: string; created_by: number; created_at: string; expires_at: string | null; is_active: number; dismissible: number; persistent: number; duration_minutes: number | null; username?: string; }
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [dismissible, setDismissible] = useState(true);
  const [persistent, setPersistent] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = () => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => { if (d.announcements) setAnnouncements(d.announcements); });
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) { setError('Message is required'); return; }
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, duration_minutes: durationMinutes, dismissible, persistent }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Server error (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTitle(''); setMessage(''); setDurationMinutes(60); setDismissible(true); setPersistent(false);
        setShowAdd(false);
        fetchAnnouncements();
      } else {
        setError(data.error || 'Failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error - check console');
    }
  };

  const toggleActive = async (id: number, current: number) => {
    await fetch('/api/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: current ? 0 : 1 }),
    });
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: number) => {
    await fetch('/api/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAnnouncements();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-sm uppercase tracking-wider font-semibold">Announcements ({announcements.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-ufc-red text-white px-5 py-2 text-xs uppercase font-semibold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
          {showAdd ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 card-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Duration (minutes)</label>
              <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} min={0} className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" />
              <p className="text-gray-600 text-[9px] mt-1">Set to 0 for no expiry (manual deactivation only)</p>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Your announcement message..." required className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all resize-none" />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-gray-300 text-xs bg-white/[0.03] rounded-xl px-4 py-3">
              <input type="checkbox" checked={dismissible} onChange={(e) => setDismissible(e.target.checked)} className="accent-ufc-red w-4 h-4" />
              <span>Dismissible (users can close it)</span>
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-xs bg-white/[0.03] rounded-xl px-4 py-3">
              <input type="checkbox" checked={persistent} onChange={(e) => setPersistent(e.target.checked)} className="accent-ufc-red w-4 h-4" />
              <span>Show on revisit (show again even if dismissed)</span>
            </label>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="bg-ufc-red text-white px-6 py-2.5 text-sm uppercase font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30">
            Send Announcement
          </button>
        </form>
      )}

      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-gray-800/50">
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Title</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Message</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Expires</th>
                <th className="text-right px-5 py-3.5 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {announcements.map((a) => {
                const expired = a.expires_at && new Date(a.expires_at) < new Date();
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-white text-xs font-medium max-w-[150px] truncate">{a.title || '—'}</td>
                    <td className="px-5 py-4 text-gray-300 text-xs max-w-[250px] truncate">{a.message}</td>
                    <td className="px-5 py-4">
                      {a.is_active && !expired ? (
                        <span className="live-badge bg-green-500/10 text-green-400 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold">Active</span>
                      ) : (
                        <span className="bg-white/5 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full uppercase">{expired ? 'Expired' : 'Inactive'}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{a.expires_at ? new Date(a.expires_at).toLocaleString() : 'Never'}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => toggleActive(a.id, a.is_active)} className={`text-xs mr-2 px-3 py-1 rounded-full transition ${
                        a.is_active ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                      }`}>
                        {a.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteAnnouncement(a.id)} className="text-red-400 text-xs px-3 py-1 rounded-full bg-red-400/10 hover:bg-red-400/20 transition">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {announcements.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">No announcements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
