import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processAndUpload } from '@/lib/upload/upload';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs'; // ✅ runs as Edge or Node depending on your Next config

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // ✅ Fake user ID for seeding (you can use any UUID here)
    const userId = '00000000-0000-0000-0000-000000000000';

    // ✅ Fully run your full existing pipeline
    const result = await processAndUpload([file], userId);

    return NextResponse.json({
      success: true,
      //docId: result.docId,  for linting
      //latency: result.latency, for linting
    });

  } catch (err: any) {
    console.error('[SEED ERROR]', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
