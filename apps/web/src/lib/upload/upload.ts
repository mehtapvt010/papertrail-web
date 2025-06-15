/* apps/web/src/lib/upload/upload.ts
   Handles: merge (PDF) → (optional) OCR pre-proc → OCR → classify
            → encrypt original + thumb → upload to Supabase Storage        */

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
  stage:
    | 'merging'
    | 'preprocessing'
    | 'compressing'
    | 'encrypting'
    | 'uploading'
    | 'ocr'
    | 'classifying'
    | 'done'
    | 'error';
}

const safe = <T,>(v: T | undefined | null): T | null =>
  v === undefined ? null : v;

export async function processAndUpload(
  files: File[],
  userId: string,
  onProgress?: (p: UploadProgress) => void
): Promise<{ docId: string; latency: number } | { error: string }> {
  try {
    const supabase = supabaseBrowser();
    const bucket = supabase.storage.from('documents');

    /* ------------------------------------------------------------ */
    /* 1. Merge PDFs if needed                                      */
    /* ------------------------------------------------------------ */
    const originalName = files.length > 1 ? 'merged.pdf' : files[0].name;
    const originalType =
      files.length > 1 ? 'application/pdf' : files[0].type;

    let rawOrigFile: File;        // THIS will be stored (after encrypt)
    if (files.length > 1 && files.every(f => f.type === 'application/pdf')) {
      onProgress?.({ pct: 5, stage: 'merging' });
      const mergedBuf = await mergePDF(
        await Promise.all(files.map(f => f.arrayBuffer()))
      );
      rawOrigFile = new File([mergedBuf], originalName, {
        type: 'application/pdf',
      });
    } else {
      rawOrigFile = files[0];
    }

    /* ------------------------------------------------------------ */
    /* 2. Build an OCR-friendly clone (pre-proc)                    */
    /* ------------------------------------------------------------ */
    let ocrSourceFile: File = rawOrigFile; // may be replaced for images

    if (rawOrigFile.type.startsWith('image/')) {
      onProgress?.({ pct: 10, stage: 'preprocessing' });

      // auto-rotate (keeps original intact)
      const rotatedBuf = await autoRotate(await rawOrigFile.arrayBuffer());

      // OpenCV clean-up, etc.
      const enhancedBlob = await preprocessImage(
        new Blob([rotatedBuf], { type: rawOrigFile.type })
      );

      ocrSourceFile = new File([enhancedBlob], originalName, {
        type: 'image/png',
        lastModified: Date.now(),
      });
    }

    /* ------------------------------------------------------------ */
    /* 3. Compress OCR source & thumb                               */
    /* ------------------------------------------------------------ */
    onProgress?.({ pct: 25, stage: 'compressing' });

    const compressed = await imageCompression(ocrSourceFile, {
      maxWidthOrHeight: 4000,
      maxSizeMB: 2,
      useWebWorker: true,
      fileType: 'image/png',
    });

    const thumbBlob = await imageCompression(compressed, {
      maxWidthOrHeight: 400,
      maxSizeMB: 0.15,
    });

    /* ------------------------------------------------------------ */
    /* 4. OCR on the compressed copy                                */
    /* ------------------------------------------------------------ */
    onProgress?.({ pct: 40, stage: 'ocr' });
    const { text, latency, mrz } = await runOcr(compressed);

    /* ------------------------------------------------------------ */
    /* 5. Classification                                            */
    /* ------------------------------------------------------------ */
    onProgress?.({ pct: 60, stage: 'classifying' });
    const cls = classify(text, originalName, mrz);

    /* ------------------------------------------------------------ */
    /* 6. Encrypt: original RAW + thumb                             */
    /* ------------------------------------------------------------ */
    onProgress?.({ pct: 70, stage: 'encrypting' });

    const key = await getUserKey(userId);

    const [origEnc, thumbEnc] = await Promise.all([
      encrypt(key, await rawOrigFile.arrayBuffer()),
      encrypt(key, await thumbBlob.arrayBuffer()),
    ]);

    const join = (enc: { iv: Uint8Array; data: ArrayBuffer }) => {
      const out = new Uint8Array(enc.iv.length + enc.data.byteLength);
      out.set(enc.iv, 0);
      out.set(new Uint8Array(enc.data), enc.iv.length);
      return abToBlob(out.buffer, 'application/octet-stream');
    };

    const origBlobEncrypted = join(origEnc);
    const thumbBlobEncrypted = join(thumbEnc);

    /* ------------------------------------------------------------ */
    /* 7. Upload                                                    */
    /* ------------------------------------------------------------ */
    onProgress?.({ pct: 85, stage: 'uploading' });

    const docId = crypto.randomUUID();
    const datePath = new Date().toISOString().split('T')[0];
    const origPath = `${userId}/${datePath}/${docId}.enc`;
    const thumbPath = `${userId}/${datePath}/${docId}_thumb.enc`;

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      bucket.upload(origPath, origBlobEncrypted),
      bucket.upload(thumbPath, thumbBlobEncrypted),
    ]);
    if (e1) throw new Error(`Upload failed: ${e1.message}`);
    if (e2) console.warn('Thumb upload warning:', e2.message);

    /* ------------------------------------------------------------ */
    /* 8. Store metadata + OCR                                      */
    /* ------------------------------------------------------------ */
    await supabase.from('documents').insert({
      id: docId,
      user_id: userId,
      file_name: originalName,
      mime_type: originalType,
      storage_path: origPath,                // points to **original** file
      type_enum: safe(cls.type_enum),
      title: safe(cls.title),
      expiry_date: safe(cls.expiry_date?.toISOString()),
      classify_confidence: cls.confidence,
    }).throwOnError();

    await storeRawOcr(supabase, docId, text);

    onProgress?.({ pct: 100, stage: 'done' });
    return { docId, latency };
  } catch (err) {
    console.error('⛔️ Upload pipeline failed:', err);
    onProgress?.({ pct: 100, stage: 'error' });
    toast.error('Upload Failed', { description: (err as Error).message });
    return { error: (err as Error).message };
  }
}
