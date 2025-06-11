import JSZip from 'jszip';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { decrypt } from '@/lib/crypto/crypto';

export async function downloadAndDecryptAll() {
  const supabase = supabaseBrowser();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not signed in');
  }

  // Fetch all documents owned by the user
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id, storage_path, mime_type')
    .eq('user_id', user.id);

  if (docsError) {
    throw docsError;
  }

  const zip = new JSZip();

  for (const doc of docs ?? []) {
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('documents')
      .download(doc.storage_path);

    if (fileError || !fileData) {
      console.warn(`Failed to download: ${doc.storage_path}`);
      continue;
    }

    const arrayBuffer = await fileData.arrayBuffer();

    try {
      const decrypted = await decrypt(arrayBuffer, user.id); // returns Uint8Array
      zip.file(`${doc.id}.${extFromMime(doc.mime_type)}`, decrypted);
    } catch (err) {
      console.warn(`Failed to decrypt: ${doc.storage_path}`, err);
      continue;
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

const extMap: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

function extFromMime(mime: string): string {
  return extMap[mime] ?? 'bin';
}
