'use client';

import { useState, useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { FileText, Search, Filter, Upload, MessageCircle, Calendar, Shield, Database, Zap, Sparkles, TrendingUp, Users, Globe, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { session, isLoading } = useSessionContext();
  const { isUnlocked } = useVault();
  const { profile } = useUserProfile();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DocFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { notifications } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search and filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (session && isUnlocked) {
        const combinedFilters: DocFilters = {
          query: searchQuery || undefined,
          type: selectedCategory !== 'all' ? selectedCategory : undefined,
          expiry: selectedStatus !== 'all' ? selectedStatus as 'expired' | 'valid' | '30d' : undefined,
        };
        
        fetchDocuments(combinedFilters).then(({ data }) => {
          setDocuments(data || []);
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [session, isUnlocked, searchQuery, selectedCategory, selectedStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 animate-pulse" />
          <span className="text-lg font-semibold">Loading your vault...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/sign-in');
  }

  const getUserDisplayName = () => {
    if (profile?.name) return profile.name;
    return session.user.email?.split('@')[0] || 'User';
  };

  const totalDocuments = documents.length;
  const recentDocuments = documents.slice(0, 5);
  const storageUsed = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const storageGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(2);

  // Category chips based on classifier types
  const categoryChips = [
    { id: 'all', label: 'All Documents', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
    { id: 'passport', label: 'Passport', icon: Shield, color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
    { id: 'id', label: 'ID Card', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' },
    { id: 'receipt', label: 'Receipts', icon: FileText, color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
    { id: 'license', label: 'License', icon: Shield, color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' },
    { id: 'insurance', label: 'Insurance', icon: Shield, color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' },
    { id: 'warranty', label: 'Warranty', icon: FileText, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' },
  ];

  // Status chips for expiry
  const statusChips = [
    { id: 'all', label: 'All Status', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
    { id: '30d', label: 'Expiring Soon', icon: Clock, color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' },
    { id: 'expired', label: 'Expired', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
    { id: 'valid', label: 'Valid', icon: Shield, color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleStatusClick = (statusId: string) => {
    setSelectedStatus(statusId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-primary/3" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <UnlockModal />

      {!isUnlocked ? null : (
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header Section */}
          <section className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Welcome back,{' '}
                      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        {getUserDisplayName()}
                      </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mt-2">
                      Your encrypted documents are safe and searchable — anytime, anywhere.
                    </p>
                  </div>
                </div>
              </div>
              <div className="animate-slide-up-delay-1">
                <UploadModal />
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Documents */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalDocuments}</p>
                    <p className="text-sm text-muted-foreground">Total Documents</p>
                  </div>
                </div>
              </div>

              {/* Storage Used */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{storageGB} GB</p>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <Sparkles className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Secure</p>
                    <p className="text-sm text-muted-foreground">Encryption Active</p>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">AI Ready</p>
                    <p className="text-sm text-muted-foreground">Smart Search</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl" />
              <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search your documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Category Filters */}
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Document Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <Badge
                    key={chip.id}
                    variant={selectedCategory === chip.id ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedCategory === chip.id 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : chip.color
                    }`}
                    onClick={() => handleCategoryClick(chip.id)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </section>

          {/* Status Filters */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Expiry Status</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <Badge
                    key={chip.id}
                    variant={selectedStatus === chip.id ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedStatus === chip.id 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : chip.color
                    }`}
                    onClick={() => handleStatusClick(chip.id)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </section>

          {/* Documents Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Your Documents
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Recently updated</span>
              </div>
            </div>
            <DocumentList filters={{
              query: searchQuery || undefined,
              type: selectedCategory !== 'all' ? selectedCategory : undefined,
              expiry: selectedStatus !== 'all' ? selectedStatus as 'expired' | 'valid' | '30d' : undefined,
            }} />
          </section>

          {/* AI Chat Section */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  AI Document Assistant
                </h2>
                <p className="text-muted-foreground">
                  Ask questions about your documents and get instant answers
                </p>
              </div>
              <ChatClient />
            </div>
          </section>

          {/* Onboarding */}
          <OnboardingDialog />

          {/* Footer */}
          <footer className="text-center py-8 border-t border-border/40">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Enterprise Security
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI-Powered Search
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Global Access
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Encrypted. Searchable. Yours.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
