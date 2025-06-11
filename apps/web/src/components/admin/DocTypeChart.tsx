'use client';

import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale, BarElement, Chart as ChartJS } from 'chart.js';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import type { Database } from '@/lib/supabase/types';

ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function DocTypeChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const supabase = supabaseBrowser();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('admin_doc_type_counts').select('*');
      setLabels(data?.map(d => d.type_enum ?? 'unknown') ?? []);
      setValues(data?.map(d => d.cnt) ?? []);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
      <Bar
        data={{ labels, datasets: [{ label: 'Total', data: values }] }}
        options={{ responsive: true, plugins: { legend: { display: false } } }}
      />
    </div>
  );
}
