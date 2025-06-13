'use client';

import { useState, useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import UploadModal from '@/components/upload/upload-modal';
import DocumentList from '@/components/document/document-list';
import ChatClient from '@/components/chat/chat-client';
import { fetchDocuments } from '@/lib/documents/documents';
import type { DocFilters } from '@/lib/documents/documents';
import { useNotifications } from '@/hooks/useNotifications';
import UnlockModal from '@/components/vault/UnlockModal';
import { useVault } from '@/providers/VaultProvider';
import { useUserProfile } from '@/hooks/useUserProfile';  // ✅ import the shared hook
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';

export default function DashboardPage() {
  const { session, isLoading } = useSessionContext();
  const { profile, loading: profileLoading } = useUserProfile(); // ✅ use hook
  const [filters, setFilters] = useState<DocFilters>({ limit: 100 });
  const [typing, setTyping] = useState('');
  const [stats, setStats] = useState({ count: 0, fields: 0, size: 0 });
  const { notifications } = useNotifications();
  const { isUnlocked } = useVault();

  useEffect(() => {
    fetchDocuments({ limit: 100 }).then(({ data }) => {
      const docs = data ?? [];
      const fields = docs.reduce((acc, doc) => {
        return (
          acc + [doc.title, doc.expiry_date, doc.type_enum, doc.classify_confidence].filter(Boolean).length
        );
      }, 0);
      const size = docs.reduce((acc, doc) => acc + (doc.file_size ?? 0), 0);
      setStats({ count: docs.length, fields, size });
    });
  }, []);

  if (!isLoading && !session) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12">
      <UnlockModal />

      {!isUnlocked ? null : (
        <>
          <section className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back,{' '}
              <span className="text-primary">
                {profile?.name || session?.user?.email?.split('@')[0] || 'User'}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Your encrypted documents are safe and searchable — anytime, anywhere.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {[{
              label: 'Documents Uploaded',
              value: stats.count.toString(),
            }, {
              label: 'Fields Extracted',
              value: stats.fields.toString(),
            }, {
              label: 'Storage Used',
              value: (stats.size / 1024).toFixed(1) + ' KB',
            }].map((stat, i) => (
              <div key={i} className="bg-muted border rounded-lg p-6 shadow-sm text-center">
                <p className="text-3xl font-semibold mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </section>

          <section className="mb-12 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">📅 Upcoming Expirations ({notifications.length})</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents expiring soon.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n: any) => (
                  <li key={n.id} className="flex justify-between border p-3 rounded-md bg-muted/30">
                    <span className="font-medium truncate max-w-xs">{n.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ⏳ {new Date(n.expires_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="text-center mb-12">
          <OnboardingDialog />
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <UploadModal />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-4 rounded-lg shadow-sm">
              <Input
                placeholder="Search titles…"
                value={typing}
                onChange={(e) => {
                  setTyping(e.target.value);
                  clearTimeout((window as any).qTimer);
                  (window as any).qTimer = setTimeout(() =>
                    setFilters((f) => ({ ...f, query: e.target.value, offset: 0 })),
                  300);
                }}
                className="flex-1 min-w-[200px] max-w-sm"
              />

              <div className="flex flex-wrap gap-2">
                <ToggleGroup type="single" value={filters.type} onValueChange={(val) => setFilters((f) => ({ ...f, type: val }))}>
                  {['passport', 'receipt', 'id', 'other'].map((t) => (
                    <ToggleGroupItem key={t} value={t}>{t}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <ToggleGroup type="single" value={filters.expiry} onValueChange={(val) => setFilters((f) => ({ ...f, expiry: val as any }))}>
                  <ToggleGroupItem value="valid">Valid</ToggleGroupItem>
                  <ToggleGroupItem value="30d">Exp ≤ 30 d</ToggleGroupItem>
                  <ToggleGroupItem value="expired">Expired</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </section>

          <section className="max-w-screen-xl mx-auto space-y-4 mb-16">
            <div className="min-h-[20rem]">
              <DocumentList filters={filters} />
            </div>
          </section>

          <section className="max-w-3xl mx-auto">
            <ChatClient />
          </section>

          <footer className="text-center mt-16 text-sm text-muted-foreground">
            Encrypted. Searchable. Yours.
          </footer>
        </>
      )}
    </div>
  );
}
