'use client';

import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchDocuments, DocFilters } from '@/lib/documents/documents';
import DocumentCard from './document-card';
import DocumentSkeleton from './document-skeleton';
import type { Database } from '@/lib/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];

export default function DocumentList({ filters }: { filters: DocFilters }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDocuments(filters).then(({ data }) => {
      setDocs(data ?? []);
      setLoading(false);
    });
  }, [filters]);

  const rowVirtualizer = useVirtualizer({
    count: loading ? 10 : docs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 190,
    overscan: 6,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto relative">
      <div
        style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const doc = docs[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className="absolute w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                top: 0,
                left: 0,
              }}
            >
              {loading ? (
                <DocumentSkeleton />
              ) : (
                <DocumentCard doc={doc} refresh={() => setDocs([...docs])} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
