'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavbarProps {
  user?: { id: number; username: string; is_admin: number } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-gray-800/80' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-ufc-red rounded-full flex items-center justify-center font-black text-white text-sm group-hover:scale-110 transition-transform">U</div>
            <span className="text-white text-xl font-bold tracking-tight">UFC.<span className="text-ufc-red">SOLUTIONS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/events', label: 'Events' },
              { href: '/rankings', label: 'Rankings' },
              { href: '/news', label: 'News' },
              { href: '/replays', label: 'Replays' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="relative px-4 py-2 text-gray-300 hover:text-white text-sm uppercase tracking-wider transition group">
                {l.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-ufc-red transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
            <a href="#" className="px-4 py-2 text-gray-300 hover:text-white text-sm uppercase tracking-wider transition">Video</a>
            <a href="#" className="px-4 py-2 text-gray-300 hover:text-white text-sm uppercase tracking-wider transition">Discord</a>
            {user?.is_admin ? (
              <Link href="/admin" className="px-4 py-2 text-ufc-red hover:text-red-300 text-sm uppercase tracking-wider font-semibold transition">Admin</Link>
            ) : null}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5">
                <div className="w-6 h-6 rounded-full bg-ufc-red flex items-center justify-center text-white text-[10px] font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 text-sm">{user.username}</span>
                <Link href="/api/auth/logout" className="text-gray-500 hover:text-white text-sm transition ml-2">Logout</Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm uppercase tracking-wider transition px-3 py-1.5">Sign In</Link>
                <Link href="/signup" className="bg-ufc-red text-white px-5 py-1.5 text-sm uppercase tracking-wider rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 p-2">
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
        <div className="md:hidden glass border-t border-gray-800 px-4 py-4 space-y-3 animate-fadeSlideUp">
          <Link href="/events" className="block text-gray-300 text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>Events</Link>
          <Link href="/rankings" className="block text-gray-300 text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>Rankings</Link>
          <Link href="/news" className="block text-gray-300 text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>News</Link>
          <Link href="/replays" className="block text-gray-300 text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>Replays</Link>
          {user?.is_admin ? (
            <Link href="/admin" className="block text-ufc-red text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>Admin</Link>
          ) : null}
          <hr className="border-gray-800" />
          {user ? (
            <Link href="/api/auth/logout" className="block text-gray-400 text-sm py-1">Logout ({user.username})</Link>
          ) : (
            <>
              <Link href="/login" className="block text-gray-300 text-sm uppercase py-1" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/signup" className="block text-ufc-red text-sm uppercase py-1 font-semibold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
