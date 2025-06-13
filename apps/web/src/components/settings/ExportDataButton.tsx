'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { downloadAndDecryptAll } from '@/lib/export/exporter';
import { saveAs } from 'file-saver';
import { Download, FileArchive, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = await downloadAndDecryptAll();
      saveAs(zip, 'papertrail-export.zip');
      setHasExported(true);
      toast.success('Data exported successfully!');
      
      // Reset the success state after 3 seconds
      setTimeout(() => setHasExported(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Export Your Data</h3>
        <p className="text-sm text-muted-foreground">
          Download all your documents as an encrypted ZIP file
        </p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <FileArchive className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Complete Data Export
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              All your documents will be downloaded as a ZIP file. The export includes:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• All uploaded documents (encrypted)</li>
              <li>• Document metadata and classifications</li>
              <li>• Search indexes and embeddings</li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleExport} 
        disabled={isExporting}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : hasExported ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Export Complete
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </>
        )}
      </Button>

      {isExporting && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Preparing your export... This may take a few moments.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
