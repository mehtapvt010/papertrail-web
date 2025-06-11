import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const ONE_GIB = 1024 ** 3;
export const QUOTA_SOFT_LIMIT = Math.floor(0.9 * ONE_GIB);

export async function getStorageUsageBytesServer(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('storage_usage_bytes', { p_user: userId });
  if (error) throw error;
  return Number(data);
}
