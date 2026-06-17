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

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#1a1a1a] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Live Comments</h2>
        {user?.is_admin ? (
          <div className="flex gap-2">
            <button onClick={clearStream} className="text-gray-400 hover:text-white text-xs uppercase">Clear Stream</button>
            <button onClick={clearAll} className="text-gray-400 hover:text-red-400 text-xs uppercase">Clear All</button>
          </div>
        ) : null}
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-2 bg-[#0a0a0a]">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 group">
            <span className="text-ufc-red text-xs font-semibold flex-shrink-0">{msg.username}</span>
            {msg.is_admin ? (
              <span className="text-[10px] bg-ufc-red text-white px-1 rounded flex-shrink-0">MOD</span>
            ) : null}
            <p className="text-gray-300 text-xs flex-1 break-words">{msg.message}</p>
            <span className="text-gray-600 text-[10px] flex-shrink-0">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {user?.is_admin ? (
              <button onClick={() => deleteMessage(msg.id)} className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition flex-shrink-0">✕</button>
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-3">
        {user ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-ufc-red"
            />
            <button type="submit" className="bg-ufc-red text-white px-4 py-2 text-xs uppercase font-semibold rounded hover:bg-red-700 transition">
              Send
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-xs text-center">Sign in to join the chat</p>
        )}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
