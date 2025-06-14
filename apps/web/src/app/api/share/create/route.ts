import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { generatePin, hashPin } from '@/lib/share';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

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

  // Confirm document exists and belongs to user
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('storage_path, mime_type')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const token = randomUUID();
  const pin = generatePin();
  const pinHash = await hashPin(pin);

  // Set expiry date to 7 days from now
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Create signed URL using service role client (bypass RLS)
  const admin = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { error: insertErr } = await admin.from('shares').insert({
    document_id: documentId,
    token,
    pin_hash: pinHash,
    expires_at: expiresAt,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const { data: urlData, error: urlErr } = await admin.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 60 * 60 * 24); // 24h

  if (urlErr || !urlData?.signedUrl) {
    return NextResponse.json({ error: urlErr?.message ?? 'Failed to create signed URL' }, { status: 500 });
  }

  const origin = process.env.VERCEL_URL?.startsWith('http')
    ? process.env.VERCEL_URL
    : `https://${process.env.VERCEL_URL}`;

  const shareUrl = new URL(`/share/${token}`, origin).toString();

  return NextResponse.json({
    token,
    pin,
    mimeType: doc.mime_type,
    signedUrl: urlData.signedUrl,
    shareUrl,
  });
}
