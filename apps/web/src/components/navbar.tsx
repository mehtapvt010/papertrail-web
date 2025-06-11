'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Button } from './ui/button';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { LuSun as Sun, LuMoon as Moon, LuBell } from 'react-icons/lu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVault } from '@/providers/VaultProvider';
import { useUserProfile } from '@/hooks/useUserProfile';

export function Navbar() {
  const { session, isLoading } = useSessionContext();
  const supabase = supabaseBrowser();
  const router = useRouter();

  const { profile, loading: profileLoading } = useUserProfile();  // ✅ use new hook

  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const currentTheme = theme === 'system' ? systemTheme : theme;

  const { notifications, mutate }: any = useNotifications();
  const [open, setOpen] = useState(false);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    mutate();
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session?.user.id);
    mutate();
    toast.success('Marked all as read.');
  };

  useEffect(() => {
    if (notifications.length && !notifications[0].is_read) {
      toast(`"${notifications[0].title}" expires soon`, {
        action: {
          label: 'Open',
          onClick: () => router.push('/dashboard?tab=docs'),
        },
      });
    }
  }, [notifications, router]);

  const { lock } = useVault();

  const logout = async () => {
    await supabase.auth.signOut();
    lock();
    router.push('/sign-in');
  };

  return (
    <nav className="flex items-center justify-between border-b bg-background px-4 py-2">
      <Link href="/" className="text-lg font-semibold">
        PaperTrail AI
      </Link>

      {!isLoading && !profileLoading && (
        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            >
              {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {session && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <LuBell className="w-5 h-5 text-muted-foreground" />
                  {notifications.some((n: any) => !n.is_read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-2">
                <div className="flex items-center justify-between mb-2 px-2">
                  <p className="text-sm font-medium">Notifications</p>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <ul className="max-h-64 overflow-y-auto space-y-1">
                  {notifications.length === 0 && (
                    <li className="text-sm text-muted-foreground px-2 py-2">No notifications.</li>
                  )}
                  {notifications
                    .sort((a: any, b: any) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())
                    .map((n: any) => (
                      <li
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          router.push('/dashboard?tab=docs');
                          setOpen(false);
                        }}
                        className={`px-3 py-2 rounded-md cursor-pointer text-sm ${
                          n.is_read
                            ? 'bg-muted/30 text-muted-foreground'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary'
                        }`}
                      >
                        <div className="font-medium truncate">{n.title}</div>
                        <div className="text-xs mt-1">
                          ⏳ {new Date(n.expires_at).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}

          {session ? (
            <>
              <Link href="/dashboard" className="text-sm">Dashboard</Link>
              <Link href="/settings" className="text-sm">Settings</Link>

              {profile?.app_role === 'admin' && (
                <Link href="/admin" className="text-sm">Admin</Link>
              )}

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
