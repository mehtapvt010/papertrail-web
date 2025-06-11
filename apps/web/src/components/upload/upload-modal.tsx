'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { processAndUpload, UploadProgress } from '@/lib/upload/upload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useQuota } from '@/hooks/useQuota';  // <-- use new hook
import { QUOTA_SOFT_LIMIT } from '@/lib/storage/usage';
import { toast } from 'sonner';

export default function UploadModal() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const supabase = supabaseBrowser();

  const { usage, loading } = useQuota();

  const overQuota = usage !== null && usage > QUOTA_SOFT_LIMIT;

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return alert('Not signed in');

      if (overQuota) {
        toast.error('Storage quota exceeded — cannot upload.');
        return;
      }

      setProgress({ pct: 0, stage: 'compressing' });
      try {
        await processAndUpload(accepted[0], user.id, setProgress);
        document.dispatchEvent(new CustomEvent('doc:uploaded'));
        setOpen(false);
      } catch (err) {
        console.error(err);
        alert('Upload failed');
      } finally {
        setProgress(null);
      }
    },
    [supabase, overQuota]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button disabled={loading || overQuota}>
          {loading ? 'Checking quota…' : overQuota ? 'Quota exceeded (1 GB)' : '➕ Upload Document'}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-11/12 max-w-md -translate-x-1/2
                     -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl
                     dark:bg-zinc-900"
        >
          <Dialog.Title className="text-lg font-semibold">
            Add a new document
          </Dialog.Title>

          <div
            {...getRootProps()}
            className={cn(
              'mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition',
              isDragActive
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-zinc-400 hover:border-blue-400'
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here…</p>
            ) : (
              <p>
                Drag & drop a PDF or image here,
                <br />
                or click to browse
              </p>
            )}
          </div>

          {progress && (
            <div className="mt-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {progress.stage.replace('-', ' ')}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-blue-600 transition-[width]"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </div>
          )}

          <Dialog.Close asChild>
            <Button variant="ghost" className="absolute right-4 top-4">
              ✕
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
