'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle2 } from 'lucide-react';
import EditDetailsDrawer from './edit-details-drawer';

type Props = {
  doc: {
    id: string;
    file_name: string;
    uploaded_at: string;
    type_enum: string | null;
    title: string | null;
    classify_confidence: number | null;
    expiry_date: string | null;
    is_indexed: boolean | null; // ✅ added
  };
  refresh: () => void;
  ocrPromise?: Promise<number>; // resolves with latency
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

  return (
    <>
      <Card className="flex items-start justify-between gap-3 p-4 shadow-sm border">
        <div className="flex gap-3">
          {status === 'pending' ? (
            <LoaderCircle className="animate-spin text-muted-foreground mt-1" />
          ) : (
            <CheckCircle2 className="text-green-600 mt-1" />
          )}

          <CardContent className="p-0 space-y-1">
            <p className="font-medium flex items-center gap-2">
              {doc.title ?? doc.file_name}

              {doc.is_indexed && (
                <Badge variant="success" className="text-xs">
                  Indexed ✓
                </Badge>
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              {new Date(doc.uploaded_at).toLocaleString()}
            </p>

            {doc.type_enum && (
              <Badge variant="outline" className="text-xs mt-1 capitalize">
                {doc.type_enum}
              </Badge>
            )}

            {doc.classify_confidence !== null && (
              <p className="text-xs text-muted-foreground">
                Classification confidence: {doc.classify_confidence}%
              </p>
            )}

            {latency !== null && (
              <p className="text-xs text-muted-foreground">
                OCR finished in {latency} ms
              </p>
            )}
          </CardContent>
        </div>

        <Button
          variant="ghost"
          className="text-sm px-2 py-0 h-auto underline underline-offset-2"
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
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
