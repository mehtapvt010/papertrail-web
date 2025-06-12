import KPICards from '@/components/admin/KPICards';
import DocTypeChart from '@/components/admin/DocTypeChart';

export const dynamic = 'force-dynamic'; // always fresh

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 py-12">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <KPICards />
      <DocTypeChart />
    </main>
  );
}
