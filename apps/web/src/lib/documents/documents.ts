import { supabaseBrowser } from '../supabase/browser';

export const supabase = supabaseBrowser();
export type DocFilters = {
  query?: string;
  type?: string;
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
    const trimmedQuery = query.trim();
    q = q.or(`title.ilike.%${trimmedQuery}%,type_enum.ilike.%${trimmedQuery}%`);
  }

  if (type) {
    q = q.eq('type_enum', type);
  }

  if (expiry === 'expired')
    q = q.lt('expiry_date', new Date().toISOString());
  if (expiry === '30d')
    q = q.lte('expiry_date', new Date(Date.now() + 2_592e6).toISOString());

  return await q.order('uploaded_at', { ascending: false }).range(offset, offset + limit - 1);
}
