'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Users, TrendingUp, Activity } from 'lucide-react';

export default function KPICards() {
  const supabase = supabaseBrowser();
  const [stats, setStats] = useState<{ uploads_day?: number; active_7d?: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: up }, { data: act }] = await Promise.all([
          supabase.from('admin_uploads_per_day').select('*').order('day', { ascending: false }).limit(1),
          supabase.from('admin_active_users').select('*').single(),
        ]);
        setStats({ uploads_day: up?.[0]?.uploads ?? 0, active_7d: act?.active_7d ?? 0 });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [supabase]);

  const kpiData = [
    {
      label: 'Uploads (24h)',
      value: stats.uploads_day ?? 0,
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      description: 'Documents uploaded today'
    },
    {
      label: 'Active Users (7d)',
      value: stats.active_7d ?? 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      description: 'Users active this week'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="card-hover animate-slide-up-delay-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              {loading && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {loading ? '...' : kpi.value.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
