import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_QDRANT_URL}/collections/documents_embeddings/points?wait=true`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.NEXT_PUBLIC_QDRANT_API_KEY!,
      },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
