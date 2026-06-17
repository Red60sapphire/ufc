'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/lib/toast';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: { id: number; username: string; is_admin: number }) => void;
}

export default function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      addToast(tab === 'login' ? `Welcome back, ${data.user.username}!` : `Account created!`, 'success');
      onLogin(data.user);
      onClose();
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg p-1">&times;</button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-ufc-red rounded-full flex items-center justify-center mx-auto mb-3 animate-ring-pulse">
            <span className="text-white text-lg font-black">U</span>
          </div>
          <h2 className="text-white text-lg font-bold uppercase tracking-wider">Join the Fight</h2>
          <p className="text-gray-500 text-xs mt-1">Sign in to chat with the community</p>
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 mb-5">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs uppercase font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-ufc-red text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs uppercase font-semibold rounded-lg transition-all ${tab === 'signup' ? 'bg-ufc-red text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
              minLength={3}
              maxLength={30}
              className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              minLength={4}
              className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ufc-red text-white py-3 text-sm uppercase font-bold tracking-wider rounded-xl hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-900/30"
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-gray-600 text-[10px] text-center mt-4 leading-relaxed">
          {tab === 'login' ? (
            <>No account? <button onClick={() => { setTab('signup'); setError(''); }} className="text-ufc-red hover:text-red-400 font-semibold">Sign up</button></>
          ) : (
            <>Already have one? <button onClick={() => { setTab('login'); setError(''); }} className="text-ufc-red hover:text-red-400 font-semibold">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
