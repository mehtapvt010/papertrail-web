// apps/web/src/lib/ocr/ocr.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import { createWorker, PSM, OEM, type Worker } from 'tesseract.js';
import { parse } from 'mrz';
import type { parse as parseMrzType } from 'mrz';

export type MRZFields = ReturnType<typeof parseMrzType>['fields'];

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('runOcr() must run in the browser');
  }
}

let workerPromise: Promise<Worker> | null = null;
async function getWorker(): Promise<Worker> {
  if (workerPromise) return workerPromise;
  workerPromise = new Promise(async (resolve) => {
    const w = await createWorker();
    await w.load();
    await w.load('eng');
    await w.reinitialize('eng', OEM.LSTM_ONLY);
    await w.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    resolve(w);
  });
  return workerPromise;
}

export async function runOcr(
  blob: Blob
): Promise<{ text: string; latency: number; mrz?: MRZFields }> {
  assertBrowser();
  const t0 = performance.now();
  const worker = await getWorker();
  const { data } = await worker.recognize(blob);
  const text = (data.text ?? '').replace(/[^\x00-\x7F]/g, '').trim();
  const latency = Math.round(performance.now() - t0);
  let mrz: MRZFields | undefined;

  // FIX: More robust MRZ line detection
  if (text.includes('<')) {
    try {
      // Filter for lines that look like MRZ lines (long, alphanumeric, containing '<')
      const allLines = text.split('\n').map(line => line.replace(/[\s\r]/g, ''));
      const potentialMrzLines = allLines.filter(line => line.length > 28 && line.includes('<') && /^[A-Z0-9<]+$/.test(line));

      if (potentialMrzLines.length >= 2) {
        // The 'mrz' library can often find the correct lines from a joined block
        const mrzBlock = potentialMrzLines.join('\n');
        const result = parse(mrzBlock);
        if (result.valid) {
          mrz = result.fields;
        } else {
          console.warn("MRZ parsing failed. Details:", result.details.filter(d => d.error));
        }
      }
    } catch (e) {
      console.warn('Error during MRZ parsing:', e);
    }
  }

  return { text, latency, mrz };
}

export async function storeRawOcr(
  supabase: SupabaseClient,
  documentId: string,
  rawText: string
) {
  const { error } = await supabase.from('doc_fields').insert({
    document_id: documentId,
    field_name: 'raw_ocr',
    field_value: rawText,
  });
  if (error) throw error;
}