'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/lib/toast';

interface Stream {
  id: number;
  title: string;
}

interface Message {
  id: number;
  username: string;
  message: string;
  is_admin: number;
  created_at: string;
  guest_name?: string;
}

function getGuestName(): string {
  if (typeof window === 'undefined') return 'Guest';
  let name = localStorage.getItem('ufc_guest_name');
  if (!name) {
    const prefixes = ['Fighter', 'Champ', 'Knockout', 'Submission', 'Octagon', 'Round', 'MMA', 'UFC'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = Math.floor(1000 + Math.random() * 9000);
    name = `${p}-${n}`;
    localStorage.setItem('ufc_guest_name', name);
  }
  return name;
}

export default function ChatBox({ streams }: { streams: Stream[] }) {
  const [activeStreamId, setActiveStreamId] = useState(streams[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; is_admin: number } | null>(null);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    setGuestName(getGuestName());
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeStreamId) return;
    const fetchMessages = () => {
      fetch(`/api/chat/messages?stream_id=${activeStreamId}`)
        .then((r) => r.json())
        .then((d) => { if (d.messages) setMessages(d.messages); })
        .catch(() => {});
    };
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeStreamId]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeStreamId) return;
    setError('');

    const body: any = { stream_id: activeStreamId, message: input.trim() };
    if (!user) {
      body.guest_name = guestName;
    }

    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setInput('');
      const res2 = await fetch(`/api/chat/messages?stream_id=${activeStreamId}`);
      const d2 = await res2.json();
      if (d2.messages) setMessages(d2.messages);
    } else {
      setError(data.error || 'Failed to send');
    }
  };

  const deleteMessage = async (id: number) => {
    await fetch('/api/chat/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_one', message_id: id }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearStream = async () => {
    await fetch('/api/chat/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_stream', stream_id: activeStreamId }),
    });
    setMessages([]);
  };

  const clearAll = async () => {
    await fetch('/api/chat/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_all' }),
    });
    setMessages([]);
  };

  const changeGuestName = () => {
    const newName = prompt('Choose your chat name:', guestName);
    if (newName && newName.trim()) {
      const name = newName.trim().slice(0, 30);
      localStorage.setItem('ufc_guest_name', name);
      setGuestName(name);
      addToast('Name changed to ' + name, 'info');
    }
  };

  if (streams.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-4 w-1 bg-ufc-red rounded-full" />
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Live Chat</h2>
      </div>

      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover">
        {streams.length > 1 && (
          <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto scrollbar-hide">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStreamId(s.id)}
                className={`flex-shrink-0 px-3 py-1 text-[10px] uppercase tracking-wider rounded-full transition-all ${
                  activeStreamId === s.id ? 'bg-ufc-red text-white shadow-lg shadow-red-900/30' : 'bg-white/5 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-3 border-b border-gray-800/50 flex items-center justify-between">
          <h3 className="text-xs text-gray-300 font-semibold">Messages</h3>
          {user?.is_admin ? (
            <div className="flex gap-2">
              <button onClick={clearStream} className="text-gray-500 hover:text-white text-[10px] uppercase transition">Clear</button>
              <button onClick={clearAll} className="text-gray-500 hover:text-red-400 text-[10px] uppercase transition">Clear All</button>
            </div>
          ) : null}
        </div>

        <div ref={scrollContainerRef} className="h-64 overflow-y-scroll p-4 space-y-2 bg-[#0a0a0a]">
          {messages.map((msg) => {
            const isGuest = !msg.is_admin && msg.username?.startsWith('Fighter-');
            return (
              <div key={msg.id} className="flex items-start gap-2 group py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isGuest ? 'bg-gray-700/50' : 'bg-ufc-red/20'}`}>
                  <span className={`text-[8px] font-bold ${isGuest ? 'text-gray-400' : 'text-ufc-red'}`}>{msg.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold ${isGuest ? 'text-gray-400' : 'text-ufc-red'}`}>{msg.username}</span>
                    {msg.is_admin ? (
                      <span className="text-[8px] bg-ufc-red/20 text-ufc-red px-1 rounded font-semibold">MOD</span>
                    ) : isGuest ? (
                      <span className="text-[8px] bg-gray-700/30 text-gray-500 px-1 rounded">GUEST</span>
                    ) : null}
                    <span className="text-gray-600 text-[9px] ml-auto">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5 break-words">{msg.message}</p>
                </div>
                {user?.is_admin ? (
                  <button onClick={() => deleteMessage(msg.id)} className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition flex-shrink-0 p-1">✕</button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-800/50 p-4">
          {user ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1 bg-white/5 border border-gray-700/50 rounded-full px-4 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
              />
              <button type="submit" disabled={!input.trim()} className="bg-ufc-red text-white px-5 py-2.5 text-xs uppercase font-semibold rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-900/20">
                Send
              </button>
            </form>
          ) : (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
                placeholder={`Chat as ${guestName}...`}
                maxLength={500}
                className="flex-1 bg-white/5 border border-gray-700/50 rounded-full px-4 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
              />
              <button onClick={sendMessage} disabled={!input.trim()} className="bg-ufc-red text-white px-5 py-2.5 text-xs uppercase font-semibold rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-900/20">
                Send
              </button>
              <button onClick={changeGuestName} className="text-gray-500 hover:text-white text-xs px-2 transition" title="Change name">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          {!user && (
            <p className="text-gray-600 text-[9px] mt-2">
              Guest name: <span className="text-gray-400 font-semibold">{guestName}</span>
              {' — '}
              <button onClick={changeGuestName} className="text-ufc-red hover:text-red-400">change</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
