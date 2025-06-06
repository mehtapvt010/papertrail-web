import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@huggingface/transformers';
import { mkdirSync } from 'fs';
import { tmpdir } from 'os';

// Disable caching – always run server-side
export const dynamic = 'force-dynamic';

type Body = { docId: string };

// Ensure model cache dir exists
const tmp = tmpdir() + '/.cache';
mkdirSync(tmp, { recursive: true });
process.env.TRANSFORMERS_CACHE = tmp;

// Security: only allow internal calls
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
    const chunks = rawText.match(/[\s\S]{1,1000}/g) ?? [];

    const extractor =
      (globalThis as any).__bge_extractor ??
      ((globalThis as any).__bge_extractor = await pipeline(
        'feature-extraction',
        'Xenova/bge-base-en-v1.5',
        {
          revision: 'main',
          //token: process.env.HF_TOKEN, // Optional but recommended
        }
      ));

    const vectors: { id: string; vector: number[]; payload: object }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const emb = await extractor(chunks[i], {
        pooling: 'mean',
        normalize: true,
      });
      vectors.push({
        id: `${docId}_${i}`,
        vector: Array.from(emb.data as Float32Array),
        payload: { docId, chunk_index: i },
      });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_QDRANT_URL}/collections/documents_embeddings/points?wait=true`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.NEXT_PUBLIC_QDRANT_API_KEY!,
          'User-Agent': 'papertrail-web/1.0',
        },
        body: JSON.stringify({ points: vectors }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

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
