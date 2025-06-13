import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { documentId }: { documentId: string } = await req.json();

  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get document details and verify ownership
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('storage_path, mime_type, file_name')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Create signed URL for 1 hour
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('Signed URL error:', signedUrlError);
    return NextResponse.json({
      error: signedUrlError?.message || 'Failed to generate view URL',
    }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: signedUrlData.signedUrl,
    mimeType: doc.mime_type,
    fileName: doc.file_name,
  });
} 