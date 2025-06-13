'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { abToBlob, getUserKey } from '@/lib/crypto/crypto';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Lock, 
  Download, 
  Copy, 
  Eye, 
  Clock, 
  FileText, 
  Shield, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Secure Document Access</h1>
          <p className="text-muted-foreground">
            Enter the PIN to decrypt and view your shared document
          </p>
        </div>

        {/* Main Card */}
        <Card className="card-hover">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Enter PIN to Access File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium">
                  Security PIN
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="text"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Access Document
                  </>
                )}
              </Button>
            </form>

            {expiresAt && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <Clock className="h-4 w-4" />
                  <span>Expires in: <Countdown target={expiresAt} /></span>
                </div>
              </div>
            )}

            {decryptedBlob && (
              <div className="space-y-4 mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Document Decrypted Successfully!</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Preview
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-muted/20">
                      <embed
                        src={downloadUrl}
                        type={decryptedBlob.type}
                        className="w-full h-96"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      asChild
                      className="flex-1"
                      size="lg"
                    >
                      <a
                        href={downloadUrl}
                        download={`document.${getFileExtension(decryptedBlob.type)}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyLink}
                      className="flex-1"
                      size="lg"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Secure • Encrypted • Private
          </p>
        </div>
      </div>
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

  return <span className="font-mono font-medium">{remaining}</span>;
}
