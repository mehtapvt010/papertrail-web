'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { abToBlob, getUserKey } from '@/lib/crypto/crypto';
import toast from 'react-hot-toast';

export default function SharePage() {
  const router = useRouter();
  const { token } = useParams() as { token: string };

  const [pin, setPin] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);

  // ⏱ Auto-refresh on expiry
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      if (new Date() > expiresAt) {
        toast.error('Link has expired');
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/share/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin }),
      });

      const result = await res.json() as {
        signedUrl: string;
        userId: string;
        expiresAt: string;
        mimeType: string;
        error?: string;
      };

      if (!res.ok) throw new Error(result.error || 'Invalid link');

      const { signedUrl, userId, expiresAt: rawExpiry, mimeType } = result;
      setMimeType(mimeType);

      const buffer = await fetch(signedUrl).then(r => r.arrayBuffer());
      const iv = new Uint8Array(buffer.slice(0, 12));
      const ciphertext = buffer.slice(12);

      console.log('Buffer total:', buffer.byteLength);
      console.log('IV:', iv);
      console.log('Ciphertext:', ciphertext.byteLength);
      console.log('Using userId as key:', userId);

      const key = await getUserKey(userId);

      let decrypted: ArrayBuffer;
      try {
        decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      } catch (err) {
        console.error('Decryption error:', err);
        toast.error('Decryption failed: invalid PIN or file format');
        return;
      }

      const blob = abToBlob(decrypted, mimeType);
      setDecryptedBlob(blob);
      setDownloadUrl(URL.createObjectURL(blob));
      setExpiresAt(new Date(rawExpiry));
      toast.success('File decrypted successfully!');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (mime: string) => {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('jpeg')) return 'jpg';
    if (mime.includes('png')) return 'png';
    return 'bin';
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">🔐 Enter PIN to Access File</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="Enter 6-digit PIN"
          className="border px-4 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Decrypting...' : 'Submit'}
        </button>
      </form>

      {expiresAt && (
        <p className="text-sm text-center text-gray-500">
          ⏱ Expires in: <Countdown target={expiresAt} />
        </p>
      )}

      {decryptedBlob && (
        <div className="space-y-4 mt-4 animate-fade-in">
          <h2 className="text-lg font-semibold">📄 Preview:</h2>
          <embed
            src={downloadUrl}
            type={decryptedBlob.type}
            className="w-full h-96 border rounded"
          />
          <div className="flex gap-4">
            <a
              href={downloadUrl}
              download={`document.${getFileExtension(decryptedBlob.type)}`}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              ⬇️ Download
            </a>
            <button
              onClick={copyLink}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              📋 Copy Share Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Countdown({ target }: { target: Date }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{remaining}</span>;
}
