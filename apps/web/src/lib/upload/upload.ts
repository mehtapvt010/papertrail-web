// apps/web/src/lib/upload/upload.ts

import imageCompression from 'browser-image-compression';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { getUserKey, encrypt, abToBlob } from '../crypto/crypto';
import { runOcr, storeRawOcr } from '@/lib/ocr/ocr';
import { classify } from '@/lib/classify/classifier';
import { autoRotate } from './image-orientation';
import { mergePDF } from './pdf-merge';
import { preprocessImage } from './preprocess-image';
import { toast } from 'sonner';

export interface UploadProgress {
  pct: number;
  stage: 'merging' | 'preprocessing' | 'compressing' | 'encrypting' | 'uploading' | 'ocr' | 'classifying' | 'done' | 'error';
}

const safe = <T,>(v: T | undefined | null): T | null => (v === undefined ? null : v);

export async function processAndUpload(
  files: File[],
  userId: string,
  onProgress?: (p: UploadProgress) => void
): Promise<{ docId: string; latency: number } | { error: string }> {
  try {
    const supabase = supabaseBrowser();
    const bucket = supabase.storage.from('documents');
    let fileToProcess: File;
    const originalName = files.length > 1 ? 'merged.pdf' : files[0].name;
    const originalType = files.length > 1 ? 'application/pdf' : files[0].type;

    console.log('[Upload] Starting process for:', originalName);

    // 1. Handle PDF merging if necessary
    if (files.length > 1 && files.every(f => f.type === 'application/pdf')) {
      onProgress?.({ pct: 2, stage: 'merging' });
      console.log('[Upload] Merging PDFs...');
      const mergedBuffer = await mergePDF(await Promise.all(files.map(f => f.arrayBuffer())));
      fileToProcess = new File([mergedBuffer], originalName, { type: 'application/pdf' });
      console.log('[Upload] PDFs merged.');
    } else {
      fileToProcess = files[0];
    }

    let imageForProcessing: File = fileToProcess;

    // 2. Image Pre-processing
    if (fileToProcess.type.startsWith('image/')) {
      onProgress?.({ pct: 5, stage: 'preprocessing' });
      console.log('[Upload] Starting image pre-processing...');

      console.log('[Upload] Auto-rotating...');
      const buffer = await fileToProcess.arrayBuffer();
      const rotatedBuffer = await autoRotate(buffer);
      console.log('[Upload] Auto-rotate complete.');

      console.log('[Upload] Applying OpenCV enhancements...');
      const preprocessedBlob = await preprocessImage(new Blob([rotatedBuffer], { type: fileToProcess.type }));
      console.log('[Upload] OpenCV enhancements complete.');

      imageForProcessing = new File([preprocessedBlob], originalName, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      console.log('[Upload] Pre-processing finished.');
    }

    // 3. Compression
    onProgress?.({ pct: 20, stage: 'compressing' });
    console.log('[Upload] Compressing image...');
    const compressed = await imageCompression(imageForProcessing, {
      maxWidthOrHeight: 4000,
      maxSizeMB: 2,
      useWebWorker: true,
      fileType: 'image/png',
    });
    console.log('[Upload] Image compressed.');

    console.log('[Upload] Creating thumbnail...');
    const thumbBlob = await imageCompression(compressed, {
      maxWidthOrHeight: 400,
      maxSizeMB: 0.15,
    });
    console.log('[Upload] Thumbnail created.');

    // 4. OCR & Classification
    onProgress?.({ pct: 40, stage: 'ocr' });
    console.log('[Upload] Starting OCR...');
    const { text, latency, mrz } = await runOcr(compressed);
    console.log(`[Upload] OCR complete in ${latency}ms.`);
    console.log('[Upload] Storing raw OCR...', text);

    onProgress?.({ pct: 70, stage: 'classifying' });
    console.log('[Upload] Classifying document...');
    const cls = classify(text, originalName, mrz);
    console.log('[Upload] Classification complete:', cls);

    // 5. Encryption
    onProgress?.({ pct: 75, stage: 'encrypting' });
    console.log('[Upload] Encrypting files...');
    const key = await getUserKey(userId);
    const [origEnc, thumbEnc] = await Promise.all([
      encrypt(key, await compressed.arrayBuffer()),
      encrypt(key, await thumbBlob.arrayBuffer()),
    ]);
    console.log('[Upload] Encryption complete.');

    const origPayload = new Uint8Array(origEnc.iv.length + origEnc.data.byteLength);
    origPayload.set(origEnc.iv, 0);
    origPayload.set(new Uint8Array(origEnc.data), origEnc.iv.length);

    const thumbPayload = new Uint8Array(thumbEnc.iv.length + thumbEnc.data.byteLength);
    thumbPayload.set(thumbEnc.iv, 0);
    thumbPayload.set(new Uint8Array(thumbEnc.data), thumbEnc.iv.length);

    const origBlob = abToBlob(origPayload.buffer, 'application/octet-stream');
    const thumbBlobEncrypted = abToBlob(thumbPayload.buffer, 'application/octet-stream');

    // 6. Upload
    onProgress?.({ pct: 85, stage: 'uploading' });
    console.log('[Upload] Uploading files to Supabase...');
    const docId = crypto.randomUUID();
    const datePath = new Date().toISOString().split('T')[0];
    const origPath = `${userId}/${datePath}/${docId}.enc`;
    const thumbPath = `${userId}/${datePath}/${docId}_thumb.enc`;

    const [{ error: uploadError }, { error: thumbUploadError }] = await Promise.all([
      bucket.upload(origPath, origBlob),
      bucket.upload(thumbPath, thumbBlobEncrypted)
    ]);

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    if (thumbUploadError) console.warn(`Thumbnail upload failed: ${thumbUploadError.message}`);
    console.log('[Upload] Files uploaded.');

    // 7. Store final metadata
    console.log('[Upload] Storing metadata...');
    await supabase.from('documents').insert({
      id: docId,
      user_id: userId,
      file_name: originalName,
      mime_type: originalType,
      storage_path: origPath,
      type_enum: safe(cls.type_enum),
      title: safe(cls.title),
      expiry_date: safe(cls.expiry_date?.toISOString()),
      classify_confidence: cls.confidence,
    }).throwOnError();
    
    await storeRawOcr(supabase, docId, text);
    console.log('[Upload] Metadata stored.');

    onProgress?.({ pct: 100, stage: 'done' });
    console.log('[Upload] Process complete!');
    return { docId, latency };

  } catch (error) {
    console.error("⛔️ UPLOAD PIPELINE FAILED:", error);
    onProgress?.({ pct: 100, stage: 'error' });
    toast.error('Upload Failed', {
      description: (error as Error).message,
    });
    return { error: (error as Error).message };
  }
}