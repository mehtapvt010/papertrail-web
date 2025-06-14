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
    .select('id, storage_path, mime_type, file_name, title')
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
      
      // Use title if available, otherwise use file_name, fallback to id
      const fileName = doc.title || doc.file_name || doc.id;
      const extension = extFromMime(doc.mime_type);
      const fullFileName = `${fileName}.${extension}`;
      
      zip.file(fullFileName, decrypted);
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
  'image/jpg': 'jpg',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

function extFromMime(mime: string): string {
  return extMap[mime] ?? 'bin';
}
