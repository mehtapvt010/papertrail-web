// apps/web/src/lib/upload/preprocess-image.ts

import cv, { Mat} from 'opencv-ts';
import { loadOpenCV } from './opencv-loader';

/**
 * Helper to load a File/Blob into an ImageData object for OpenCV.
 */
async function loadImageData(file: Blob): Promise<ImageData> {
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

/**
 * Preprocess image using OpenCV to improve OCR accuracy.
 */
export async function preprocessImage(file: Blob): Promise<Blob> {
  // Declare Mats here to ensure they are in scope for the finally block
  let src: Mat | undefined;
  let gray: Mat | undefined;
  let denoised: Mat | undefined;
  let thresh: Mat | undefined;

  try {
    console.log('[Preprocess] 1. Entered preprocessImage function.');

    await loadOpenCV(); // Now safely inside the try...catch block
    console.log('[Preprocess] 2. OpenCV library is confirmed to be ready.');

    const imageData = await loadImageData(file);
    console.log(`[Preprocess] 3. Loaded image into ImageData (${imageData.width}x${imageData.height}).`);

    src = cv.matFromImageData(imageData);
    gray = new cv.Mat();
    denoised = new cv.Mat();
    thresh = new cv.Mat();
    
    console.log('[Preprocess] 4. Converting to grayscale...');
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    console.log('[Preprocess] 5. Denoising...');
    cv.bilateralFilter(gray, denoised, 9, 75, 75, cv.BORDER_DEFAULT);

    console.log('[Preprocess] 6. Applying adaptive threshold...');
    cv.adaptiveThreshold(
      denoised,
      thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      31,
      10
    );

    console.log('[Preprocess] 7. Converting final Mat back to Blob...');
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, thresh);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error('Canvas to Blob conversion failed.'));
      }, 'image/png')
    );
    
    console.log('[Preprocess] 8. Pre-processing finished successfully.');
    return blob;

  } catch(error) {
    console.error("⛔️ OpenCV processing pipeline failed:", error);
    throw error;
  } finally {
    console.log('[Preprocess] 9. Cleaning up OpenCV Mats...');
    src?.delete();
    gray?.delete();
    denoised?.delete();
    thresh?.delete();
    console.log('[Preprocess] Cleanup complete.');
  }
}