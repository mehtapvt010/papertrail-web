'use client';

import { Button } from '@/components/ui/button';
import { downloadAndDecryptAll } from '@/lib/export/exporter';
import { saveAs } from 'file-saver';

export default function ExportDataButton() {
  const handleExport = async () => {
    const zip = await downloadAndDecryptAll();
    saveAs(zip, 'papertrail-export.zip');
  };

  return (
    <Button id="export" onClick={handleExport}>
      Download ZIP of all my files
    </Button>
  );
}
