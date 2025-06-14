'use client';

import useSWR from 'swr';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = supabaseBrowser();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setEnabled(!!session);
      } catch (error) {
        console.warn('Error checking auth for notifications:', error);
        setEnabled(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const supabase = supabaseBrowser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setEnabled(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data, mutate, error } : any = useSWR(
    enabled ? '/api/notifications' : null,
    fetcher,
    {
      refreshInterval: 1_800_000, // 30 min
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (err) => {
        console.warn('Notifications fetch error:', err);
      },
    }
  );

  const unread = data?.filter((n: any) => !n.is_read) || [];

  return {
    notifications: data ?? [],
    unreadCount: unread.length,
    mutate,
    error,
  };
}
