'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';

interface NavbarProps {
  user?: { id: number; username: string; is_admin: number } | null;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/fighters', label: 'Fighters' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/news', label: 'News' },
  { href: '/replays', label: 'Replays' },
];

export default function Navbar({ user: initialUser }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fighterResults, setFighterResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogin = (u: { id: number; username: string; is_admin: number }) => {
    setUser(u);
    window.location.reload();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setFighterResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fighters?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setFighterResults(data.data?.slice(0, 5) || []);
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const pageResults = searchQuery.trim()
    ? navLinks.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.href.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasResults = pageResults.length > 0 || fighterResults.length > 0;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-gray-800/80 shadow-2xl shadow-black/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-ufc-red rounded-full flex items-center justify-center font-black text-white text-sm group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-900/50">U</div>
              <span className="text-white text-xl font-bold tracking-tight">UFC.<span className="text-ufc-red">SOLUTIONS</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.filter(l => l.href !== '/').map((l) => (
                <Link key={l.href} href={l.href} className="relative px-4 py-2 text-sm uppercase tracking-wider transition group">
                  <span className={`${pathname === l.href ? 'text-white' : 'text-gray-400 hover:text-white'}`}>{l.label}</span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-ufc-red transition-all duration-300 ${pathname === l.href ? 'w-3/4' : 'w-0 group-hover:w-3/4'}`} />
                </Link>
              ))}
              <a href="https://discord.gg/Dh2gUUgYTg" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-gray-400 hover:text-white text-sm uppercase tracking-wider transition">Discord</a>
              {user?.is_admin ? (
                <Link href="/admin" className={`px-4 py-2 text-sm uppercase tracking-wider font-semibold transition ${pathname === '/admin' ? 'text-white' : 'text-ufc-red hover:text-red-300'}`}>Admin</Link>
              ) : null}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-white p-2 transition" title="Search fighters, pages...">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              {user ? (
                <div className="flex items-center gap-2 bg-white/[0.04] border border-gray-800/50 rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-ufc-red flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-red-900/30">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-300 text-sm">{user.username}</span>
                  <button onClick={handleLogout} className="text-gray-600 hover:text-white text-xs transition ml-1 p-1">✕</button>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className="bg-ufc-red text-white px-5 py-1.5 text-xs uppercase tracking-wider rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30">
                  Sign In
                </button>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-white p-2 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-300 p-2">
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
        </div>

        {menuOpen && (
          <div className="md:hidden glass border-t border-gray-800 px-4 py-4 space-y-1 animate-slide-down">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`block text-sm uppercase py-2 px-3 rounded-lg transition ${pathname === l.href ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'}`}>
                {l.label}
              </Link>
            ))}
            <Link href="/head-to-head" className="block text-gray-400 text-sm uppercase py-2 px-3 rounded-lg hover:text-white hover:bg-white/[0.03] transition">Head to Head</Link>
            <a href="https://discord.gg/Dh2gUUgYTg" target="_blank" rel="noopener noreferrer" className="block text-gray-400 text-sm uppercase py-2 px-3 rounded-lg hover:text-white hover:bg-white/[0.03] transition">Discord</a>
            <hr className="border-gray-800 my-2" />
            {user ? (
              <div className="px-3 space-y-1">
                <div className="flex items-center gap-2 text-gray-300 text-sm py-1">
                  <div className="w-5 h-5 rounded-full bg-ufc-red flex items-center justify-center text-white text-[8px] font-bold">{user.username.charAt(0).toUpperCase()}</div>
                  {user.username}
                </div>
                <button onClick={handleLogout} className="block text-gray-500 text-sm py-1 hover:text-white transition">Logout</button>
              </div>
            ) : (
              <button onClick={() => { setShowLogin(true); setMenuOpen(false); }} className="w-full bg-ufc-red text-white text-sm uppercase font-semibold py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30">Sign In</button>
            )}
          </div>
        )}
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center border-b border-gray-800/50 px-4">
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fighters, pages..."
                  autoFocus
                  className="w-full bg-transparent text-white text-sm px-3 py-4 focus:outline-none placeholder-gray-600"
                />
                {searching && <div className="w-4 h-4 border-2 border-ufc-red border-t-transparent rounded-full animate-spin flex-shrink-0" />}
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-gray-500 hover:text-white text-xs p-1">&times;</button>
              </div>
              {searchQuery.trim() && (
                <div className="p-2 max-h-80 overflow-y-auto">
                  {fighterResults.length > 0 && (
                    <div className="mb-2">
                      <p className="text-gray-600 text-[10px] uppercase tracking-wider px-3 py-1 font-semibold">Fighters</p>
                      {fighterResults.map((f: any) => (
                        <Link key={f.id} href={`/fighter/${f.id}`} onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition text-sm">
                          <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                            {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{f.name.charAt(0)}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-xs font-semibold truncate block">{f.name}</span>
                            <span className="text-gray-500 text-[10px]">{f.record || ''} {f.weightClass ? `• ${f.weightClass}` : ''}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {pageResults.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-[10px] uppercase tracking-wider px-3 py-1 font-semibold">Pages</p>
                      {pageResults.map(r => (
                        <Link key={r.href} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition text-sm">
                          <span className="text-gray-400">{r.label}</span>
                          <span className="text-gray-600 text-[10px] ml-auto">{r.href}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {!hasResults && !searching && (
                    <p className="text-gray-500 text-xs text-center py-6">No results found for &ldquo;{searchQuery}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
