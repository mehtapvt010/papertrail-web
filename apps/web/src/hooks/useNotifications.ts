'use client';

import useSWR from 'swr';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = supabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setEnabled(!!session);
    };
    checkAuth();
  }, []);

  const { data, mutate } : any = useSWR(
    enabled ? '/api/notifications' : null,
    fetcher,
    {
      refreshInterval: 1_800_000, // 30 min
    }
  );

  const unread = data?.filter((n: any) => !n.is_read) || [];

  return {
    notifications: data ?? [],
    unreadCount: unread.length,
    mutate,
  };
}
