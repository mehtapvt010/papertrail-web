import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPin } from '@/lib/share';

export async function POST(req: NextRequest) {
  const { token, pin } = await req.json() as { token?: string; pin?: string };

  if (!token || !pin) {
    return NextResponse.json({ error: 'token & pin required' }, { status: 400 });
  }

  const admin = await createClient();

  const { data: row, error } = await admin
    .from('shares')
    .select('pin_hash, expires_at, documents(storage_path, user_id, mime_type, title, file_name)')
    .eq('token', token)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: 'link not found' }, { status: 404 });
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'link expired' }, { status: 410 });
  }

  const isValid = await verifyPin(pin, row.pin_hash);
  if (!isValid) {
    return NextResponse.json({ error: 'invalid pin' }, { status: 401 });
  }

  const document = Array.isArray(row.documents)
    ? row.documents[0]
    : row.documents;

  const storagePath = document?.storage_path;
  const userId = document?.user_id;
  const mimeType = document?.mime_type;

  if (!storagePath || !userId || !mimeType) {
    console.error('Missing required document fields:', document);
    return NextResponse.json({ error: 'missing document fields' }, { status: 500 });
  }

  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 10); // 10 min

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    return NextResponse.json({
      error: signedUrlError?.message || 'signed URL error',
      debug: { storagePath },
    }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: signedUrlData.signedUrl,
    userId,
    expiresAt: row.expires_at,
    mimeType,
  });
}
