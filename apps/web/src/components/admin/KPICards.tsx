'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Card, CardContent } from '@/components/ui/card';

export default function KPICards() {
  const supabase = supabaseBrowser();
  const [stats, setStats] = useState<{ uploads_day?: number; active_7d?: number }>({});

  useEffect(() => {
    const fetchStats = async () => {
      const [{ data: up }, { data: act }] = await Promise.all([
        supabase.from('admin_uploads_per_day').select('*').order('day', { ascending: false }).limit(1),
        supabase.from('admin_active_users').select('*').single(),
      ]);
      setStats({ uploads_day: up?.[0]?.uploads ?? 0, active_7d: act?.active_7d ?? 0 });
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <p>Uploads (24h)</p>
          <h3 className="text-3xl font-bold">{stats.uploads_day}</h3>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p>Active Users (7d)</p>
          <h3 className="text-3xl font-bold">{stats.active_7d}</h3>
        </CardContent>
      </Card>
    </div>
  );
}
