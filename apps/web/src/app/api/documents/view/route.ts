import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto/crypto';

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
    .select('storage_path, mime_type, file_name, title')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  try {
    // Download the encrypted file
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(doc.storage_path);

    if (fileError || !fileData) {
      console.error('File download error:', fileError);
      return NextResponse.json({
        error: fileError?.message || 'Failed to download document',
      }, { status: 500 });
    }

    // Decrypt the file
    const arrayBuffer = await fileData.arrayBuffer();
    const decryptedData = await decrypt(arrayBuffer, user.id);

    // Convert to base64 for transmission
    const base64Data = Buffer.from(decryptedData).toString('base64');

    return NextResponse.json({
      decryptedData: base64Data,
      mimeType: doc.mime_type,
      fileName: doc.title || doc.file_name,
      originalFileName: doc.file_name,
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json({
      error: 'Failed to decrypt document',
    }, { status: 500 });
  }
} 