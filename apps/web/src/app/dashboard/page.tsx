import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic'; // force per-request cookies

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12">
      {/* Header */}
      <section className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, <span className="text-primary">{user.email}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Your encrypted documents are safe and searchable — anytime, anywhere.
        </p>
      </section>

      {/* Stats Section (placeholder for now) */}
      <section className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
        {[
          {
            label: 'Documents Uploaded',
            value: '23',
          },
          {
            label: 'Fields Extracted',
            value: '172',
          },
          {
            label: 'Storage Used',
            value: '8.4 MB',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-muted border rounded-lg p-6 shadow-sm text-center"
          >
            <p className="text-3xl font-semibold mb-2">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Actions Section */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <a href="/capture">📷 Upload New Document</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/library">📂 View My Vault</a>
          </Button>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="text-center mt-16 text-sm text-muted-foreground">
        Encrypted. Searchable. Yours.
      </footer>
    </div>
  );
}
