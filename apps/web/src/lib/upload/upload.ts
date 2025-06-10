// src/lib/upload/upload.ts
import imageCompression from 'browser-image-compression';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { getUserKey, encrypt, abToBlob } from '../crypto/crypto';
import { runOcr, storeRawOcr } from '@/lib/ocr/ocr';
import { classify } from '@/lib/classify/classifier';

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props: Record<string, string> }) => void;
  }
}

export interface UploadProgress {
  pct: number;
  stage:
    | 'compressing'
    | 'encrypting'
    | 'uploading-orig'
    | 'uploading-thumb'
    | 'ocr'
    | 'done';
}

const safe = <T,>(v: T | undefined | null): T | null =>
  v === undefined ? null : v;

export async function processAndUpload(
  file: File,
  userId: string,
  onProgress?: (p: UploadProgress) => void
): Promise<{ docId: string; latency: number }> {
  const supabase = supabaseBrowser();
  const bucket = supabase.storage.from('documents');

  // 1️⃣ Compress
  onProgress?.({ pct: 5, stage: 'compressing' });
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 4000,
    maxSizeMB: 2,
    useWebWorker: true,
  });

  const thumbBlob = await imageCompression(compressed, {
    maxWidthOrHeight: 400,
    maxSizeMB: 0.15,
  });

  // 2️⃣ Encrypt
  onProgress?.({ pct: 25, stage: 'encrypting' });
  const key = await getUserKey(userId);

  const [origEnc, thumbEnc] = await Promise.all([
    encrypt(key, await compressed.arrayBuffer()),
    encrypt(key, await thumbBlob.arrayBuffer()),
  ]);

  // Prepend IV to ciphertext
  const origPayload = new Uint8Array(origEnc.iv.length + origEnc.data.byteLength);
  origPayload.set(origEnc.iv, 0);
  origPayload.set(new Uint8Array(origEnc.data), origEnc.iv.length);

  const thumbPayload = new Uint8Array(thumbEnc.iv.length + thumbEnc.data.byteLength);
  thumbPayload.set(thumbEnc.iv, 0);
  thumbPayload.set(new Uint8Array(thumbEnc.data), thumbEnc.iv.length);

  const origBlob = abToBlob(origPayload.buffer, 'application/octet-stream');
  const thumbBlobEncrypted = abToBlob(thumbPayload.buffer, 'application/octet-stream');

  // 3️⃣ Upload
  const docId = crypto.randomUUID();
  const datePath = new Date().toISOString().split('T')[0];
  const origPath = `${userId}/${datePath}/${docId}.enc`;
  const thumbPath = `${userId}/${datePath}/${docId}_thumb.enc`;

  onProgress?.({ pct: 55, stage: 'uploading-orig' });
  await bucket.upload(origPath, origBlob, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  });

  onProgress?.({ pct: 85, stage: 'uploading-thumb' });
  await bucket.upload(thumbPath, thumbBlobEncrypted, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  });

  // Initial metadata
  await supabase
    .from('documents')
    .insert({
      id: docId,
      user_id: userId,
      file_name: file.name,
      mime_type: file.type,
      storage_path: origPath,
      uploaded_at: new Date().toISOString(),
    })
    .throwOnError();

  // 4️⃣ OCR & classification
  onProgress?.({ pct: 92, stage: 'ocr' });
  const { text, latency } = await runOcr(compressed);
  await storeRawOcr(supabase, docId, text);
  const cls = classify(text, file.name);

  await supabase
    .from('documents')
    .update({
      type_enum: safe(cls.type_enum),
      title: safe(cls.title),
      expiry_date: safe(cls.expiry_date ? cls.expiry_date.toISOString() : null),
      classify_confidence: cls.confidence,
    })
    .eq('id', docId)
    .throwOnError();

  // 5️⃣ Analytics
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('OCR Completed', {
      props: { latency_ms: latency.toString() },
    });
    window.plausible('Classification Completed', {
      props: {
        type: cls.type_enum ?? 'unknown',
        confidence: cls.confidence.toString(),
      },
    });
  }

  onProgress?.({ pct: 100, stage: 'done' });
  return { docId, latency };
}
