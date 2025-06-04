/**
 * AES-GCM 256 helpers using the Web Crypto API.
 * Each user gets a deterministic key derived from their Supabase user.id hash.
 */
const enc = new TextEncoder();
//const dec = new TextDecoder();

/** Derive a CryptoKey from the user's UUID (cheap PBKDF2 stand-in for MVP). */
export async function getUserKey(userId: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(userId));
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Encrypt an ArrayBuffer (returns {iv, ciphertext}). *//** Encrypt an ArrayBuffer (returns { iv, ciphertext }). */
export async function encrypt(
  key: CryptoKey,
  buffer: ArrayBuffer
): Promise<{ iv: Uint8Array; data: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 🔑  ⭐️  <-  THE important line
  const bytes = new Uint8Array(buffer);   // create a view in *this* realm

  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    bytes        // Node/WebCrypto now accepts it
  );
  return { iv, data };
}

/** Convenience – covert ArrayBuffer → Blob for upload. */
export function abToBlob(ab: ArrayBuffer, type: string) {
  return new Blob([ab], { type });
}
