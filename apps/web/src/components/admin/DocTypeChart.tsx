'use client';

import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale, BarElement, Chart as ChartJS } from 'chart.js';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import type { Database } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function DocTypeChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = supabaseBrowser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase.from('admin_doc_type_counts').select('*');
        setLabels(data?.map(d => d.type_enum ?? 'unknown') ?? []);
        setValues(data?.map(d => d.cnt) ?? []);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const chartData = {
    labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        label: 'Document Count',
        data: values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)', // green
          'rgba(168, 85, 247, 0.8)', // purple
          'rgba(245, 158, 11, 0.8)', // orange
          'rgba(239, 68, 68, 0.8)',  // red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} documents`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
        }
      }
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-xl">Document Types Distribution</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading chart data...</span>
              </div>
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
        
        {!loading && labels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No document data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
