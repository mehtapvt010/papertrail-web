/**
 * AES-GCM 256 helpers using the Web Crypto API.
 * Each user gets a deterministic key derived from their Supabase user.id hash.
 */
const enc = new TextEncoder();

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

/** Encrypt an ArrayBuffer (returns { iv, ciphertext }). */
export async function encrypt(
  key: CryptoKey,
  buffer: ArrayBuffer
): Promise<{ iv: Uint8Array; data: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = new Uint8Array(buffer);
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    bytes
  );
  return { iv, data };
}

/** Decrypt an encrypted file downloaded from Supabase Storage (.enc Blob).
 * Expects full ArrayBuffer where first 12 bytes are IV, rest is ciphertext.
 * Returns decrypted Uint8Array.
 */
export async function decrypt(
  buffer: ArrayBuffer,
  userId: string
): Promise<Uint8Array> {
  const key = await getUserKey(userId);

  const full = new Uint8Array(buffer);
  const iv = full.slice(0, 12);
  const ciphertext = full.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new Uint8Array(plaintext);
}

/** Convenience – covert ArrayBuffer → Blob for upload. */
export function abToBlob(ab: ArrayBuffer, type: string) {
  return new Blob([ab], { type });
}
