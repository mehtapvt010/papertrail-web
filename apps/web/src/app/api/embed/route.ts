import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@huggingface/transformers';

// Disable caching – always run server-side
export const dynamic = 'force-dynamic';

type Body = { docId: string };

// 1) Security helper — only allow calls that present the service-role secret
function assertAuthorized(req: NextRequest) {
  const header = req.headers.get('x-service-role-secret');
  if (header !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    assertAuthorized(req);

    const { docId } = (await req.json()) as Body;
    if (!docId) {
      return NextResponse.json({ error: 'docId required' }, { status: 400 });
    }

    // 2) Load raw OCR text from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: ocrRows, error } = await supabase
      .from('doc_fields')
      .select('field_value')
      .eq('document_id', docId)
      .eq('field_name', 'raw_ocr')
      .limit(1);

    if (error || !ocrRows?.[0]) {
      return NextResponse.json({ error: 'OCR not found' }, { status: 404 });
    }
    const rawText: string = ocrRows[0].field_value;

    // 3) Chunk ≤1000-char windows
    const chunks = rawText.match(/[\s\S]{1,1000}/g) ?? [];

    // 4) Lazy-load the BGE model once per cold start
    //    WASM is cached in /tmp after first download.
    const extractor =
      (globalThis as any).__bge_extractor ??
      ((globalThis as any).__bge_extractor = await pipeline(
        'feature-extraction',
        'Xenova/bge-base-en-v1.5' // auto-downloads ONNX weights
      ));

    // 5) Build Qdrant payload
    const vectors: { id: string; vector: number[]; payload: object }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const emb = await extractor(
        chunks[i],
        { pooling: 'mean', normalize: true } // recommended opts :contentReference[oaicite:1]{index=1}
      );
      vectors.push({
        id: `${docId}_${i}`, // docId_pageChunk
        vector: Array.from(emb.data as Float32Array),
        payload: { docId, chunk_index: i },
      });
    }

    // 6) Upsert to Qdrant
    const res = await fetch(
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

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    // 7) Mark document as indexed
    await supabase
      .from('documents')
      .update({ is_indexed: true })
      .eq('id', docId);

    return NextResponse.json({ status: 'ok', chunks: chunks.length });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
