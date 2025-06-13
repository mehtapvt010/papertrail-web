'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { processAndUpload, UploadProgress } from '@/lib/upload/upload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useQuota } from '@/hooks/useQuota';
import { QUOTA_SOFT_LIMIT } from '@/lib/storage/usage';
import { toast } from 'sonner';
import { Upload, X, FileText, Image, FileCheck, Loader2 } from 'lucide-react';

export default function UploadModal() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const supabase = supabaseBrowser();

  const { usage, loading } = useQuota();
  const overQuota = usage !== null && usage > QUOTA_SOFT_LIMIT;

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('You are not signed in.');
      return;
    }

    if (overQuota) {
      toast.error('Storage quota exceeded — cannot upload.');
      return;
    }

    setProgress({ pct: 0, stage: 'compressing' });
    try {
      await processAndUpload(accepted, user.id, setProgress);
      document.dispatchEvent(new CustomEvent('doc:uploaded'));
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setProgress(null);
    }
  }, [supabase, overQuota]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    onDrop,
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button 
          disabled={loading || overQuota}
          size="lg"
          className="card-hover"
        >
          <Upload className="h-5 w-5 mr-2" />
          {loading ? 'Checking quota…' : overQuota ? 'Quota exceeded (1 GB)' : 'Upload Document'}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-11/12 max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border shadow-xl z-50 p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold">Upload Documents</Dialog.Title>
                <p className="text-sm text-muted-foreground">Add new documents to your vault</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={cn(
                'relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                isDragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              )}
            >
              <input {...getInputProps()} />
              
              <div className="text-center space-y-3">
                {isDragActive ? (
                  <>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <FileCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Drop files here</p>
                      <p className="text-sm text-muted-foreground">Release to upload</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-muted rounded-full">
                      <div className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-muted-foreground" />
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Drag & drop files here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports PDF and images up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">
                    {progress.stage.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {progress.pct}%
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out flex items-center justify-center"
                    style={{ width: `${progress.pct}%` }}
                  >
                    {progress.pct > 10 && (
                      <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quota Warning */}
            {overQuota && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Storage quota exceeded. Please upgrade your plan or delete some documents.
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
