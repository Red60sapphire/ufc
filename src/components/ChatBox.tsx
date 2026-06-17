'use client';

import { useState, useEffect, useRef } from 'react';

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
}

export default function ChatBox({ streams }: { streams: Stream[] }) {
  const [activeStreamId, setActiveStreamId] = useState(streams[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; is_admin: number } | null>(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeStreamId) return;
    setError('');

    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stream_id: activeStreamId, message: input.trim() }),
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
                  activeStreamId === s.id ? 'bg-ufc-red text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-gray-800'
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

        <div className="h-64 overflow-y-auto p-4 space-y-2 bg-[#0a0a0a]">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 group py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="w-5 h-5 rounded-full bg-ufc-red/20 flex items-center justify-center flex-shrink-0">
                <span className="text-ufc-red text-[8px] font-bold">{msg.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-ufc-red text-[10px] font-semibold">{msg.username}</span>
                  {msg.is_admin ? (
                    <span className="text-[8px] bg-ufc-red/20 text-ufc-red px-1 rounded font-semibold">MOD</span>
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
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800/50 p-4">
          {user ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
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
            <p className="text-gray-500 text-xs text-center py-1">Sign in to join the chat</p>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
