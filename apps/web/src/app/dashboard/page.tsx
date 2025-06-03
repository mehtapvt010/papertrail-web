import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // ensures per-request cookie read

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p className="mt-4">Your secure vault awaits 🚀</p>
    </section>
  );
}
