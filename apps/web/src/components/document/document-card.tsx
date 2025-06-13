'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle2, Share2, Edit3, Calendar, FileText, Download, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import EditDetailsDrawer from './edit-details-drawer';
import ViewDocumentModal from './view-document-modal';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabaseBrowser } from '@/lib/supabase/browser';

const EmbedClient = dynamic(() => import('@/components/embed/EmbedClient'), {
  ssr: false,
});

type Props = {
  doc: {
    id: string;
    file_name: string;
    uploaded_at: string | null;
    type_enum: string | null;
    title: string | null;
    classify_confidence: number | null;
    expiry_date: string | null;
    is_indexed: boolean | null;
    thumbnail_url?: string | null;
    notification_id?: string;
  };
  refresh: () => void;
  ocrPromise?: Promise<number>;
};

export default function DocumentCard({ doc, refresh, ocrPromise }: Props) {
  const [status, setStatus] = useState<'pending' | 'done'>(
    ocrPromise ? 'pending' : 'done'
  );
  const [latency, setLatency] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    if (!ocrPromise) return;
    ocrPromise.then((ms) => {
      setLatency(ms);
      setStatus('done');
    });
  }, [ocrPromise]);

  useEffect(() => {
    const markNotificationRead = async () => {
      if (!doc.notification_id) return;
  
      const supabase = supabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (!session) return; // 🚫 Skip if not signed in
  
      await fetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ id: doc.notification_id }),
      });
  
      refresh();
    };
  
    markNotificationRead();
  }, [doc.notification_id, refresh]);
  

  const expiresSoon =
    doc.expiry_date &&
    new Date(doc.expiry_date).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
    new Date(doc.expiry_date).getTime() > Date.now();

  const getDocIcon = (type: string | null) => {
    switch (type) {
      case 'passport':
        return '🛂';
      case 'receipt':
        return '🧾';
      case 'id':
        return '🆔';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case 'passport':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800';
      case 'receipt':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800';
      case 'id':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const handleShare = async () => {
    const res = await fetch('/api/share/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id }),
    });

    if (!res.ok) {
      toast.error('Failed to create share link');
      return;
    }

    const { token, pin } = await res.json() as { token: string; pin: string };

    const shareUrl = `${window.location.origin}/share/${token}`;
    const full = `${shareUrl} PIN: ${pin}`;

    try {
      await navigator.clipboard.writeText(full);
      toast.success('🔗 Share Link Created', {
        description: `PIN: ${pin}`,
      });
    } catch {
      toast.warning('Copied URL only. PIN: ' + pin);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-300 card-hover">
        <CardContent className="p-0">
          {/* Thumbnail */}
          {doc.thumbnail_url && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={doc.thumbnail_url}
                alt={doc.title ?? 'Document preview'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Status indicator */}
              <div className="absolute top-3 right-3">
                {status === 'pending' ? (
                  <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getDocIcon(doc.type_enum)}</span>
                  <h3 className="font-semibold text-lg truncate">
                    {doc.title ?? doc.file_name}
                  </h3>
                </div>
                
                {doc.is_indexed && (
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                    ✓ Indexed
                  </Badge>
                )}
              </div>
            </div>

            {/* Type Badge */}
            {doc.type_enum && (
              <div className="mb-4">
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize border ${getTypeColor(doc.type_enum)}`}
                >
                  {doc.type_enum}
                </Badge>
              </div>
            )}

            {/* Expiry Warning */}
            {expiresSoon && doc.expiry_date && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Expiring on {new Date(doc.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
              
              {doc.classify_confidence !== null && (
                <div className="flex items-center gap-2">
                  <span>Confidence: {doc.classify_confidence}%</span>
                </div>
              )}
              
              {latency !== null && (
                <div className="flex items-center gap-2">
                  <span>OCR: {latency}ms</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="flex-1"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewOpen(true)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>

            {/* Embed Client */}
            {!doc.is_indexed && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <EmbedClient docId={doc.id} refresh={refresh} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditDetailsDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        doc={doc}
        refresh={refresh}
      />

      <ViewDocumentModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        documentId={doc.id}
        documentName={doc.title ?? doc.file_name}
      />
    </>
  );
}
