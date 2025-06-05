'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle, CheckCircle2 } from 'lucide-react';

type Props = {
  //id: string;
  fileName: string;
  uploadedAt: string;
  ocrPromise?: Promise<number>; // resolves with latency
};

export default function DocumentCard({
  //id,
  fileName,
  uploadedAt,
  ocrPromise,
}: Props) {
  const [status, setStatus] = useState<'pending' | 'done'>(
    ocrPromise ? 'pending' : 'done'
  );
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (!ocrPromise) return;
    ocrPromise.then((ms) => {
      setLatency(ms);
      setStatus('done');
    });
  }, [ocrPromise]);

  return (
    <Card className="flex items-center gap-3 p-4">
      {status === 'pending' ? (
        <LoaderCircle className="animate-spin text-muted-foreground" />
      ) : (
        <CheckCircle2 className="text-green-600" />
      )}

      <CardContent className="p-0 grow">
        <p className="font-medium">{fileName}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(uploadedAt).toLocaleString()}
        </p>
        {latency !== null && (
          <p className="text-xs text-muted-foreground">
            OCR finished in {latency} ms
          </p>
        )}
      </CardContent>
    </Card>
  );
}
