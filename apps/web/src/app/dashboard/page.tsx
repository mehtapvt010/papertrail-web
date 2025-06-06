import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UploadModal from '@/components/upload/upload-modal';
import DocumentCard from '@/components/document/document-card';

export const dynamic = 'force-dynamic'; // force per-request cookies

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching documents:', error.message);
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
            value: documents?.length ?? '0',
          },
          {
            label: 'Fields Extracted',
            value: '—', // to be implemented
          },
          {
            label: 'Storage Used',
            value: '—', // to be implemented
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

      {/* Upload & Library */}
      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <UploadModal />
          <Button size="lg" variant="outline" asChild>
            <a href="/library">📂 View My Vault</a>
          </Button>
        </div>
      </section>

      {/* Document List */}
      <section className="max-w-4xl mx-auto space-y-4">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              refresh={async () => {
                'use server';
                redirect('/dashboard'); // SSR refresh
              }}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No documents uploaded yet.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center mt-16 text-sm text-muted-foreground">
        Encrypted. Searchable. Yours.
      </footer>
    </div>
  );
}
