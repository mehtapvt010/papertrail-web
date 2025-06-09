// src/hooks/useNotifications.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNotifications() {
  const { data, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 1_800_000, // 30 min
  }) as any;

  const unread = data?.filter((n: any) => !n.is_read) || [];
  return {
    notifications: data ?? [],
    unreadCount: unread.length,
    mutate,
  };
}
