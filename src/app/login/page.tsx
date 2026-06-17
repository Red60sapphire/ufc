'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    setLoading(false);
    if (data.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ufc-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-black">U</span>
          </div>
          <h1 className="text-white text-xl font-bold">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-8 card-hover">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 focus:bg-white/[0.07] transition-all"
              />
            </div>
            {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ufc-red text-white py-3 text-sm uppercase font-bold tracking-wider rounded-xl hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-900/30"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-ufc-red hover:text-red-400 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
