// apps/web/src/components/document/document-list.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchDocuments, DocFilters } from '@/lib/documents/documents';
import DocumentCard from './document-card';
import DocumentSkeleton from './document-skeleton';
import type { Database } from '@/lib/supabase/types';
import { FileText, Search } from 'lucide-react';

const Filler = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground col-span-full animate-fade-in">
    <div className="w-20 h-20 mb-6 rounded-full bg-muted flex items-center justify-center shadow-inner">
      <Search className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-2xl font-semibold mb-3 animate-slide-up-delay-1">
      {message}
    </h3>
    <p className="text-muted-foreground max-w-md animate-slide-up-delay-2">
      Whether you are uploading passports, receipts, or contracts — everything is end-to-end encrypted and searchable.
    </p>
  </div>
);

type Document = Database['public']['Tables']['documents']['Row'];

export default function DocumentList({ filters }: { filters: DocFilters }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDocs = useCallback(() => {
    setLoading(true);
    fetchDocuments(filters).then(({ data }) => {
      setDocs(data ?? []);
      setLoading(false);
    });
  }, [filters]);

  // Effect for initial load and when filters change
  useEffect(() => {
    refreshDocs();
  }, [filters, refreshDocs]);

  // Effect to listen for the custom upload event for auto-refresh
  useEffect(() => {
    const handleUploadSuccess = () => {
      console.log('✅ Upload successful, refreshing dashboard...');
      refreshDocs();
    };

    document.addEventListener('doc:uploaded', handleUploadSuccess);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('doc:uploaded', handleUploadSuccess);
    };
  }, [refreshDocs]); // Re-add listener if refreshDocs changes

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <DocumentSkeleton key={i} />)
        : docs.map((doc) => <DocumentCard key={doc.id} doc={doc} refresh={() => setDocs([...docs])} />)}

      {!loading && docs.length === 0 && (
        <Filler message="No documents found matching your filters" />
      )}
    </div>
  );
}