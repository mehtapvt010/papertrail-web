import imageCompression from 'browser-image-compression';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { getUserKey, encrypt, abToBlob } from '../crypto/crypto';
import { runOcr, storeRawOcr } from '@/lib/ocr/ocr';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props: Record<string, string> }) => void;
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

export async function processAndUpload(
  file: File,
  userId: string,
  onProgress?: (p: UploadProgress) => void
): Promise<{ docId: string; latency: number }> {
  const supabase = supabaseBrowser();
  const bucket = supabase.storage.from('documents');

  onProgress?.({ pct: 5, stage: 'compressing' });
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 4000,
    maxSizeMB: 2,
    useWebWorker: true
  });

  const thumbBlob = await imageCompression(compressed, {
    maxWidthOrHeight: 400,
    maxSizeMB: 0.15
  });

  onProgress?.({ pct: 25, stage: 'encrypting' });
  const key = await getUserKey(userId);
  const [origEnc, thumbEnc] = await Promise.all([
    encrypt(key, await compressed.arrayBuffer()),
    encrypt(key, await thumbBlob.arrayBuffer())
  ]);

  const origBlob = abToBlob(origEnc.data, 'application/octet-stream');
  const thumbBlobEncrypted = abToBlob(thumbEnc.data, 'application/octet-stream');

  const docId = crypto.randomUUID();
  const datePath = new Date().toISOString().split('T')[0];
  const origPath = `${userId}/${datePath}/${docId}.enc`;
  const thumbPath = `${userId}/${datePath}/${docId}_thumb.enc`;

  onProgress?.({ pct: 55, stage: 'uploading-orig' });
  await bucket.upload(origPath, origBlob, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',
    upsert: false
  });

  onProgress?.({ pct: 85, stage: 'uploading-thumb' });
  await bucket.upload(thumbPath, thumbBlobEncrypted, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',
    upsert: false
  });

  // ✅ catch 409 conflict (already exists)
  const { error: docErr } = await supabase.from('documents').insert({
    id: docId,
    user_id: userId,
    file_name: file.name,
    mime_type: file.type,
    storage_path: origPath,
    uploaded_at: new Date().toISOString()
  });

  if (docErr && docErr.code !== '23505') {
    throw docErr;
  }

  onProgress?.({ pct: 92, stage: 'ocr' });
  const { text, latency } = await runOcr(thumbBlob);
  await storeRawOcr(supabase, docId, text);

  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('OCR Completed', {
      props: { latency_ms: latency.toString() }
    });
  }

  onProgress?.({ pct: 100, stage: 'done' });
  return { docId, latency };
}
