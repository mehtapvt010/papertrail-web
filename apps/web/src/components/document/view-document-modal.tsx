'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, X, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ViewDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName: string;
}

export default function ViewDocumentModal({ 
  open, 
  onOpenChange, 
  documentId, 
  documentName 
}: ViewDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  useEffect(() => {
    if (open && documentId) {
      generateViewUrl();
    }
  }, [open, documentId]);

  const generateViewUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate view URL');
      }

      const data = await response.json() as {
        signedUrl: string;
        mimeType: string;
        fileName: string;
      };
      setSignedUrl(data.signedUrl);
      setMimeType(data.mimeType);
    } catch (error) {
      console.error('Error generating view URL:', error);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!signedUrl) return;
    
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const getFileExtension = (mime: string) => {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('jpeg')) return 'jpg';
    if (mime.includes('png')) return 'png';
    return 'bin';
  };

  const isImage = mimeType?.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary-foreground" />
              </div>
              <DialogTitle className="text-xl">View Document</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {documentName}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : signedUrl ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-muted/20 h-96">
                {isImage ? (
                  <img
                    src={signedUrl}
                    alt={documentName}
                    className="w-full h-full object-contain"
                  />
                ) : isPDF ? (
                  <iframe
                    src={signedUrl}
                    className="w-full h-full"
                    title={documentName}
                  />
                ) : (
                  <embed
                    src={signedUrl}
                    type={mimeType || 'application/octet-stream'}
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {mimeType ? mimeType.toUpperCase() : 'Unknown Type'}
                  </span>
                </div>
                
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Failed to load document
                </p>
                <Button
                  variant="outline"
                  onClick={generateViewUrl}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 