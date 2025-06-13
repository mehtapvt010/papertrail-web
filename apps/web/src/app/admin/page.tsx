import KPICards from '@/components/admin/KPICards';
import DocTypeChart from '@/components/admin/DocTypeChart';
import { BarChart3, Users, Upload, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic'; // always fresh

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-xl text-muted-foreground">Monitor system performance and user activity</p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* KPI Cards */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold">Key Metrics</h2>
            </div>
            <KPICards />
          </section>

          {/* Charts Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold">Document Analytics</h2>
            </div>
            <DocTypeChart />
          </section>
        </div>
      </div>
    </div>
  );
}
