import { supabaseBrowser } from '../supabase/browser';
import { Database } from '@/lib/supabase/types'; // your generated types

export const supabase = supabaseBrowser();

export type DocFilters = {
  query?: string;
  type?: string;         // passport, receipt, …
  expiry?: 'expired' | 'valid' | '30d';
  limit?: number;
  offset?: number;
};

export async function fetchDocuments({
  query,
  type,
  expiry,
  limit = 50,
  offset = 0,
}: DocFilters) {
  let q = supabase.from('documents').select('*', { count: 'exact' });

  if (query && query.trim()) {
    q = q.textSearch('title_tsv', query.trim(), { type: 'websearch' });
  }
  if (type) q = q.eq('doc_type', type);
  if (expiry === 'expired') q = q.lt('expires_at', new Date().toISOString());
  if (expiry === '30d')
    q = q.lte('expires_at', new Date(Date.now() + 2_592e6).toISOString()); // 30 days

  return await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
}
