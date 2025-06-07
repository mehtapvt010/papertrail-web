import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { pipeline } from 'https://esm.sh/@xenova/transformers@2.5.1?target=deno&bundle';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { record } = body;

    if (!record?.id) {
      return new Response("Missing 'record.id'", { status: 400 });
    }

    const docId = record.id;

    // 1. Fetch raw OCR from doc_fields
    const { data: ocrRows, error } = await supabase
      .from('doc_fields')
      .select('field_value')
      .eq('document_id', docId)
      .eq('field_name', 'raw_ocr')
      .limit(1);

    if (error || !ocrRows?.[0]) {
      return new Response(JSON.stringify({ error: 'OCR not found' }), { status: 404 });
    }

    const rawText: string = ocrRows[0].field_value;
    const chunks = rawText.match(/[\s\S]{1,1000}/g) ?? [];

    // 2. Load the model once per cold start (WASM only)
    const extractor =
      (globalThis as any).__bge_extractor ??
      ((globalThis as any).__bge_extractor = await pipeline(
        'feature-extraction',
        'Xenova/bge-base-en-v1.5',
        {
          backend: 'wasm', // 🔥 critical: avoids Node.js-only dependencies
        }
      ));

    // 3. Embed each chunk
    const vectors: { id: string; vector: number[]; payload: object }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const output = await extractor(chunks[i], {
        pooling: 'mean',
        normalize: true
      });

      vectors.push({
        id: `${docId}_${i}`,
        vector: Array.from(output.data as Float32Array),
        payload: { docId, chunk_index: i }
      });
    }

    // 4. Upload to Qdrant
    const qdrantRes = await fetch(
      `${Deno.env.get('QDRANT_URL')}/collections/documents_embeddings/points?wait=true`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': Deno.env.get('QDRANT_API_KEY')!,
        },
        body: JSON.stringify({ points: vectors })
      }
    );

    if (!qdrantRes.ok) {
      const err = await qdrantRes.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    // 5. Mark document as indexed
    await supabase
      .from('documents')
      .update({ is_indexed: true })
      .eq('id', docId);

    return new Response(JSON.stringify({ status: 'ok', chunks: chunks.length }));
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
