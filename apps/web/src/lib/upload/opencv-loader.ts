// apps/web/src/lib/upload/opencv-loader.ts

import cv from 'opencv-ts';

let loadingPromise: Promise<void> | null = null;

/**
 * Reliably loads the OpenCV.js Wasm runtime. Can be called multiple times
 * but will only execute the loading process once.
 */
export function loadOpenCV(): Promise<void> {
  // If the library is already loaded, return immediately.
  // A simple check for a core function is sufficient.
  if (cv.cvtColor!) {
    return Promise.resolve();
  }

  // If loading is already in progress, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start the loading process
  loadingPromise = new Promise((resolve, reject) => {
    console.log('[OpenCV] Wasm runtime not found. Starting initialization...');
    
    // The opencv-ts module sets a global cv.onRuntimeInitialized callback
    // once the Wasm runtime is ready for use.
    cv.onRuntimeInitialized = () => {
      console.log('[OpenCV] Wasm runtime initialized successfully.');
      resolve();
    };

    // Add a failsafe timeout in case something goes wrong with initialization.
    setTimeout(() => {
      reject(new Error('OpenCV.js initialization timed out after 8 seconds.'));
    }, 8000);
  });

  return loadingPromise;
}