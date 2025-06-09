'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import EditDetailsDrawer from './edit-details-drawer';
import Image from 'next/image';

const EmbedClient = dynamic(() => import('@/components/embed/EmbedClient'), {
  ssr: false,
});

type Props = {
  doc: {
    id: string;
    file_name: string;
    uploaded_at: string | null;
    type_enum: string | null;
    title: string | null;
    classify_confidence: number | null;
    expiry_date: string | null;
    is_indexed: boolean | null;
    thumbnail_url?: string | null;
    notification_id?: string; // Optional for marking read
  };
  refresh: () => void;
  ocrPromise?: Promise<number>;
};

export default function DocumentCard({ doc, refresh, ocrPromise }: Props) {
  const [status, setStatus] = useState<'pending' | 'done'>(
    ocrPromise ? 'pending' : 'done'
  );
  const [latency, setLatency] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!ocrPromise) return;
    ocrPromise.then((ms) => {
      setLatency(ms);
      setStatus('done');
    });
  }, [ocrPromise]);

  // Optional hook to mark notification as read on mount
  useEffect(() => {
    if (!doc.notification_id) return;

    fetch('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id: doc.notification_id }),
    }).then(() => refresh());
  }, [doc.notification_id, refresh]);

  const expiresSoon = doc.expiry_date
    ? new Date(doc.expiry_date).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
      new Date(doc.expiry_date).getTime() > Date.now()
    : false;

  const getDocIcon = (type: string | null) => {
    switch (type) {
      case 'passport': return '🛂';
      case 'receipt': return '🧾';
      case 'id': return '🆔';
      default: return '📄';
    }
  };

  return (
    <>
      <Card className="flex items-start justify-between gap-4 p-4 shadow-sm border bg-background transition-colors">
        <div className="flex gap-3 w-full">
          {/* Status icon */}
          <div className="flex-shrink-0 pt-1">
            {status === 'pending' ? (
              <LoaderCircle className="animate-spin text-muted-foreground" />
            ) : (
              <CheckCircle2 className="text-green-600" />
            )}
          </div>

          <CardContent className="p-0 space-y-2 w-full">
            {/* Lazy Thumbnail */}
            {doc.thumbnail_url && (
              <Image
                src={doc.thumbnail_url}
                alt={doc.title ?? 'Document preview'}
                width={400}
                height={150}
                className="h-28 w-full rounded-md object-cover"
                loading="lazy"
              />
            )}

            {/* Title & Edit button */}
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm line-clamp-1 flex gap-2 items-center">
                {getDocIcon(doc.type_enum)} {doc.title ?? doc.file_name}
                {doc.is_indexed && (
                  <Badge variant="success" className="text-xs">
                    Indexed ✓
                  </Badge>
                )}
              </p>
              <Button
                variant="ghost"
                className="text-xs px-2 py-0 h-auto underline underline-offset-2"
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>
            </div>

            {/* Expiry badge */}
            {expiresSoon && doc.expiry_date && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
                ⚠️ Expiring on {new Date(doc.expiry_date).toLocaleDateString()}
              </div>
            )}

            {/* Meta details */}
            <p className="text-xs text-muted-foreground">
              Uploaded:{' '}
              {doc.uploaded_at
                ? new Date(doc.uploaded_at).toLocaleString()
                : 'Unknown'}
            </p>

            {doc.type_enum && (
              <Badge variant="outline" className="text-xs mt-1 capitalize">
                {doc.type_enum}
              </Badge>
            )}

            {doc.classify_confidence !== null && (
              <p className="text-xs text-muted-foreground">
                Confidence: {doc.classify_confidence}%
              </p>
            )}

            {latency !== null && (
              <p className="text-xs text-muted-foreground">
                OCR finished in {latency} ms
              </p>
            )}

            {/* Embed button */}
            {!doc.is_indexed && (
              <div className="pt-2">
                <EmbedClient docId={doc.id} refresh={refresh} />
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      <EditDetailsDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        doc={doc}
        refresh={refresh}
      />
    </>
  );
}
