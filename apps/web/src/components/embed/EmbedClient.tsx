'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  docId: string;
  refresh: () => void;
};

export default function EmbedClient({ docId, refresh }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleEmbed() {
    try {
      setLoading(true);

      toast('🔍 Embedding started', {
        description: 'Extracting vectors from OCR text…',
      });

      // 1. Load OCR
      const { data, error } = await supabase
        .from('doc_fields')
        .select('field_value')
        .eq('document_id', docId)
        .eq('field_name', 'raw_ocr')
        .limit(1)
        .single();

      if (error || !data?.field_value) {
        throw new Error('OCR not found');
      }

      const rawText = data.field_value;
      const chunks = rawText.match(/[\s\S]{1,1000}/g) ?? [];

      // 2. Lazy-load BGE model
      const extractor =
        (globalThis as any).__bge_extractor ??
        ((globalThis as any).__bge_extractor = await pipeline(
          'feature-extraction',
          'Xenova/bge-base-en-v1.5'
        ));

      // 3. Embed chunks
      const vectors = [];
      for (let i = 0; i < chunks.length; i++) {
        const output = await extractor(chunks[i], {
          pooling: 'mean',
          normalize: true,
        });

        vectors.push({
          id: `${docId}_${i}`,
          vector: Array.from(output.data as Float32Array),
          payload: { docId, chunk_index: i },
        });
      }

      // 4. Upload to Qdrant
      const qdrantRes = await fetch(
        `${process.env.NEXT_PUBLIC_QDRANT_URL}/collections/documents_embeddings/points?wait=true`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.NEXT_PUBLIC_QDRANT_API_KEY!,
          },
          body: JSON.stringify({ points: vectors }),
        }
      );

      if (!qdrantRes.ok) {
        const err = await qdrantRes.text();
        throw new Error(err);
      }

      // 5. Mark document as indexed
      await supabase
        .from('documents')
        .update({ is_indexed: true })
        .eq('id', docId);

      toast('✅ Embedding complete', {
        description: `Uploaded ${chunks.length} chunks`,
      });

      refresh(); // Re-fetch document data
    } catch (e: any) {
      console.error(e);
      toast('❌ Embedding failed', {
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleEmbed} disabled={loading}>
      {loading ? 'Embedding…' : 'Run Embedding'}
    </Button>
  );
}
