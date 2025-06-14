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
import { useUserProfile } from '@/hooks/useUserProfile';
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';
import { FileText, Search, Filter, Upload, MessageCircle, Calendar, Shield, Database } from 'lucide-react';

export default function DashboardPage() {
  const { session, isLoading } = useSessionContext();
  const { profile, loading: profileLoading } = useUserProfile();
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

  // Get user display name
  const getUserDisplayName = () => {
    if (profileLoading) return '...';
    if (profile?.name) return profile.name;
    if (session?.user?.email) return session.user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <UnlockModal />

      {!isUnlocked ? null : (
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <section className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Welcome back,{' '}
                  <span className="text-primary">
                    {getUserDisplayName()}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Your encrypted documents are safe and searchable — anytime, anywhere.
                </p>
              </div>
              <div className="animate-slide-up-delay-1">
                <UploadModal />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="mb-12">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
              {[
                {
                  label: 'Documents Uploaded',
                  value: stats.count.toString(),
                  icon: FileText,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50 dark:bg-blue-950/20',
                },
                {
                  label: 'Fields Extracted',
                  value: stats.fields.toString(),
                  icon: Database,
                  color: 'text-green-600',
                  bgColor: 'bg-green-50 dark:bg-green-950/20',
                },
                {
                  label: 'Storage Used',
                  value: (stats.size / 1024).toFixed(1) + ' KB',
                  icon: Shield,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50 dark:bg-purple-950/20',
                },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`${stat.bgColor} border rounded-xl p-6 shadow-sm card-hover animate-slide-up-delay-${i + 1}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <section className="mb-12 max-w-4xl">
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-200">
                    Upcoming Expirations ({notifications.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="font-medium truncate max-w-xs">{n.title}</span>
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        ⏳ {new Date(n.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Search and Filters Section */}
          <section className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search your documents..."
                        value={typing}
                        onChange={(e) => {
                          setTyping(e.target.value);
                          clearTimeout((window as any).qTimer);
                          (window as any).qTimer = setTimeout(() =>
                            setFilters((f) => ({ ...f, query: e.target.value, offset: 0 })),
                          300);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                    </div>
                    <ToggleGroup type="single" value={filters.type} onValueChange={(val) => setFilters((f) => ({ ...f, type: val }))}>
                      {['Passport', 'Receipt', 'ID', 'Other'].map((t) => (
                        <ToggleGroupItem key={t} value={t} className="text-xs">
                          {t}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    </div>
                    <ToggleGroup type="single" value={filters.expiry} onValueChange={(val) => setFilters((f) => ({ ...f, expiry: val as any }))}>
                      <ToggleGroupItem value="valid" className="text-xs">Valid</ToggleGroupItem>
                      <ToggleGroupItem value="30d" className="text-xs">Exp ≤ 30d</ToggleGroupItem>
                      <ToggleGroupItem value="expired" className="text-xs">Expired</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="mb-16">
            <div className="max-w-screen-xl mx-auto">
              <div className="min-h-[20rem]">
                <DocumentList filters={filters} />
              </div>
            </div>
          </section>

          {/* Chat Section */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <ChatClient />
            </div>
          </section>

          {/* Onboarding */}
          <OnboardingDialog />

          {/* Footer */}
          <footer className="text-center py-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
              Encrypted. Searchable. Yours.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
