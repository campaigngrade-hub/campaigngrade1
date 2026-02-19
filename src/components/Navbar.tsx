'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';

export default function Navbar() {
  const { profile, loading } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="bg-navy text-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-amber-400">Campaign</span>
            <span>Grade</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/firms" className="hover:text-amber-300 transition-colors">
              Browse Firms
            </Link>
            <Link href="/about" className="hover:text-amber-300 transition-colors">
              About
            </Link>
            {!loading && (
              <>
                {profile ? (
                  <>
                    {profile.role === 'platform_admin' && (
                      <>
                        <Link href="/admin" className="hover:text-amber-300 transition-colors">
                          Admin
                        </Link>
                        <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
                          Dashboard
                        </Link>
                      </>
                    )}
                    {profile.role === 'firm_admin' && (
                      <Link href="/firm-dashboard" className="hover:text-amber-300 transition-colors">
                        Firm Dashboard
                      </Link>
                    )}
                    {profile.role === 'reviewer' && (
                      <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
                        Dashboard
                      </Link>
                    )}
                    {profile.is_verified && (
                      <Link href="/reviews/new">
                        <Button variant="secondary" size="sm">
                          Rate a Firm
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-amber-300 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup">
                      <Button variant="secondary" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-navy-light pt-3 space-y-2">
            <Link href="/firms" className="block py-2 hover:text-amber-300">Browse Firms</Link>
            <Link href="/about" className="block py-2 hover:text-amber-300">About</Link>
            {profile ? (
              <>
                {profile.role === 'platform_admin' && (
                  <Link href="/admin" className="block py-2 hover:text-amber-300">Admin</Link>
                )}
                <Link href="/dashboard" className="block py-2 hover:text-amber-300">Dashboard</Link>
                {profile.is_verified && (
                  <Link href="/reviews/new" className="block py-2 text-amber-300">Rate a Firm</Link>
                )}
                <button onClick={handleSignOut} className="block py-2 text-gray-300">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 hover:text-amber-300">Sign In</Link>
                <Link href="/signup" className="block py-2 text-amber-300">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
