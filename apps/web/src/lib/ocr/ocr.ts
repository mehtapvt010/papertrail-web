import type { SupabaseClient } from '@supabase/supabase-js';

// 🧠 Ensure this only runs in browser
function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('runOcr() must run in the browser');
  }
}

/**
 * Dynamically imports tesseract.js and initializes the worker.
 */
async function getWorker() {
  assertBrowser();
  const { createWorker } = await import('tesseract.js');
  const worker = createWorker();

  await (await worker).load('eng');     // ✅ use only recommended APIs
  await (await worker).reinitialize('eng');

  return worker;
}

/**
 * Runs OCR on a given image blob. Strips non-ASCII and limits length.
 */
export async function runOcr(blob: Blob): Promise<{ text: string; latency: number }> {
  const t0 = performance.now();
  const worker = await getWorker();

  const { data } = await worker.recognize(blob); // ✅ no logger passed

  await worker.terminate();

  let text = (data.text ?? '').replace(/[^\x00-\x7F]/g, '').trim();
  if (text.length > 1000) text = text.slice(0, 1000);

  const latency = Math.round(performance.now() - t0);
  return { text, latency };
}

/**
 * Inserts OCR text into Supabase doc_fields table.
 */
export async function storeRawOcr(
  supabase: SupabaseClient,
  documentId: string,
  rawText: string
): Promise<void> {
  const { error } = await supabase.from('doc_fields').insert({
    document_id: documentId,
    field_name: 'raw_ocr',
    field_value: rawText,
    confidence: 1.0
  });

  if (error) throw error;
}
