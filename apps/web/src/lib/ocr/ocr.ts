// src/lib/ocr/ocr.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { createWorker, PSM, OEM } from 'tesseract.js';

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('runOcr() must run in the browser');
  }
}

/**
 * Initialize a Tesseract worker with a more aggressive page‐segmentation mode
 * and a limited whitelist (common for passports). If you find that this
 * misses some characters, you can remove the whitelist or add more symbols.
 */
async function getWorker() {
  assertBrowser();
  // createWorker() returns a Promise<Worker> in the latest tesseract.js types
  const worker = await createWorker();

  // 1) load English
  await worker.load();
  await worker.load('eng');
  // 2) initialize with LSTM engine only
  await worker.reinitialize('eng', OEM.LSTM_ONLY);
  // 3) tell Tesseract to treat the entire page as a single block of text
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK, 
    // Optional whitelist: uppercase letters, digits, space, slash, less‐than sign
    // Passport MRZ often uses A–Z, 0–9, “<”.  Feel free to tweak or remove if
    // you find that it’s dropping valid characters. 
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/ ',
  });

  return worker;
}

/**
 * Runs OCR on a given full-resolution image blob. Strips out non-ASCII,
 * trims to 1000 chars max, and returns the raw text + latency.
 */
export async function runOcr(
  blob: Blob
): Promise<{ text: string; latency: number }> {
  const t0 = performance.now();
  const worker = await getWorker();

  // Recognize the entire blob at once
  const { data } = await worker.recognize(blob);

  // Clean up
  await worker.terminate();

  // Keep only ASCII (so classify’s regex for “Date of …” is more reliable)
  let text = (data.text ?? '').replace(/[^\x00-\x7F]/g, '').trim();
  if (text.length > 1000) {
    text = text.slice(0, 1000); // clip to 1000 chars
  }

  const latency = Math.round(performance.now() - t0);
  return { text, latency };
}

/**
 * Inserts the raw OCR text into Supabase under doc_fields.{ raw_ocr }.
 */
export async function storeRawOcr(
  supabase: SupabaseClient,
  documentId: string,
  rawText: string
) {
  const { error } = await supabase.from('doc_fields').insert({
    document_id: documentId,
    field_name: 'raw_ocr',
    field_value: rawText,
    confidence: 1.0,
  });
  if (error) throw error;
}
