'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  user?: { id: number; username: string; is_admin: number } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#111] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-ufc-red text-2xl font-bold tracking-tight">UFC.SOLUTIONS</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/events" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">Events</Link>
            <Link href="/news" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">News</Link>
            <Link href="/replays" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">Replays</Link>
            <a href="#" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">Video</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">Discord</a>
            {user?.is_admin ? (
              <Link href="/admin" className="text-ufc-red hover:text-red-400 text-sm uppercase tracking-wider font-semibold">Admin</Link>
            ) : null}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{user.username}</span>
                <Link href="/api/auth/logout" className="text-gray-400 hover:text-white text-sm">Logout</Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider">Sign In</Link>
                <Link href="/signup" className="bg-ufc-red text-white px-4 py-1.5 text-sm uppercase tracking-wider rounded hover:bg-red-700">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#111] border-t border-gray-800 px-4 py-4 space-y-3">
          <Link href="/events" className="block text-gray-300 text-sm uppercase" onClick={() => setMenuOpen(false)}>Events</Link>
          <Link href="/news" className="block text-gray-300 text-sm uppercase" onClick={() => setMenuOpen(false)}>News</Link>
          <Link href="/replays" className="block text-gray-300 text-sm uppercase" onClick={() => setMenuOpen(false)}>Replays</Link>
          <Link href="/admin" className="block text-ufc-red text-sm uppercase" onClick={() => setMenuOpen(false)}>Admin</Link>
          <hr className="border-gray-800" />
          {user ? (
            <Link href="/api/auth/logout" className="block text-gray-400 text-sm">Logout ({user.username})</Link>
          ) : (
            <>
              <Link href="/login" className="block text-gray-300 text-sm uppercase" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/signup" className="block text-ufc-red text-sm uppercase" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
