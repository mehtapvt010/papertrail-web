'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Button } from './ui/button';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function Navbar() {
  const { session, isLoading } = useSessionContext();
  const supabase = supabaseBrowser();
  const router = useRouter();

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
        <div className="space-x-2">
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
