import imageCompression from 'browser-image-compression';
import { supabaseBrowser } from '@/lib/supabase/browser';   // already exists
import { getUserKey, encrypt, abToBlob } from '../crypto/crypto';

export interface UploadProgress {
  pct: number;             // 0–100
  stage:
    | 'compressing'
    | 'encrypting'
    | 'uploading-orig'
    | 'uploading-thumb'
    | 'done';
}

/**
 * Compress → thumbnail → encrypt → upload both files.
 * Returns the Supabase Storage paths for original & thumbnail.
 */
export async function processAndUpload(
  file: File,
  userId: string,
  onProgress?: (p: UploadProgress) => void
) {
  //const user=await supabaseBrowser().auth.getUser();
  const supabase = supabaseBrowser();
  const bucket = supabase.storage.from('documents');

  // 1. compress large images (>10 MP ≈ 10 000 000 px)
  onProgress?.({ pct: 5, stage: 'compressing' });
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 4000,
    maxSizeMB: 2,
    useWebWorker: true
  });

  // 2. client-side thumbnail (≈ 400 px longest edge)
  const thumbBlob = await imageCompression(compressed, {
    maxWidthOrHeight: 400,
    maxSizeMB: 0.15
  });

  // 3. AES-GCM encrypt
  onProgress?.({ pct: 25, stage: 'encrypting' });
  const key = await getUserKey(userId);
  console.log('compressed:', compressed);
  const [origEnc, thumbEnc] = await Promise.all([
    encrypt(key, await compressed.arrayBuffer()),
    encrypt(key, await thumbBlob.arrayBuffer())
  ]);

  const origBlob = abToBlob(origEnc.data, 'application/octet-stream');
  const thumbBlobEncrypted = abToBlob(thumbEnc.data, 'application/octet-stream');

  // 4. Supabase upload (private bucket)
  const id = crypto.randomUUID();
  const datePath = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const origPath = `${userId}/${datePath}/${id}.enc`;
  const thumbPath = `${userId}/${datePath}/${id}_thumb.enc`;

  onProgress?.({ pct: 55, stage: 'uploading-orig' });
  await bucket.upload(origPath, origBlob, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',    // Optional but good practice
    upsert: false            // Avoid overwriting existing files
  });

  onProgress?.({ pct: 85, stage: 'uploading-thumb' });
  await bucket.upload(thumbPath, thumbBlobEncrypted, {
    contentType: 'application/octet-stream',
    cacheControl: '3600',
    upsert: false
  });


  onProgress?.({ pct: 100, stage: 'done' });

  return { origPath, thumbPath };
}
