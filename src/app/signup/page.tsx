'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
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
      setError(data.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm bg-[#111] border border-gray-800 rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-ufc-red text-2xl font-bold">UFC.SOLUTIONS</h1>
          <p className="text-gray-400 text-sm mt-1">Create Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ufc-red"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ufc-red text-white py-2.5 text-sm uppercase font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-4">
          Already have an account? <Link href="/login" className="text-ufc-red hover:text-red-400">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
