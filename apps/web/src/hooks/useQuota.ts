'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { ONE_GIB, QUOTA_SOFT_LIMIT } from '@/lib/storage/usage';

export function useQuota() {
  const [usage, setUsage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      const supabase = supabaseBrowser();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        setUsage(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('storage_usage_bytes', { p_user: user.id });
      if (error) {
        console.error('Quota fetch error:', error);
        setUsage(0);
      } else {
        setUsage(Number(data));
      }
      setLoading(false);
    };

    fetchQuota();
  }, []);

  return { usage, loading };
}
