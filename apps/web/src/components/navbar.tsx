'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Button } from './ui/button';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { LuSun as Sun, LuMoon as Moon } from 'react-icons/lu';

export function Navbar() {
  const { session, isLoading } = useSessionContext();
  const supabase = supabaseBrowser();
  const router = useRouter();

  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <nav className="flex items-center justify-between border-b bg-background px-4 py-2">
      <Link href="/" className="text-lg font-semibold">
        PaperTrail AI
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            >
              {currentTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {session ? (
            <>
              <Link href="/dashboard" className="text-sm">
                Dashboard
              </Link>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
