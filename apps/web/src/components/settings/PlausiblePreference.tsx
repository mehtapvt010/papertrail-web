'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export default function PlausiblePreference() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('plausible_ignore');
    setEnabled(!stored);
  }, []);

  const handleChange = (checked: boolean) => {
    if (checked) {
      delete localStorage.plausible_ignore;
      setEnabled(true);
    } else {
      localStorage.plausible_ignore = 'true';
      setEnabled(false);
    }
    alert('Reload the page for change to take effect');
  };

  return (
    <div className="flex items-center gap-4">
      <Switch id="plausible" checked={enabled} onCheckedChange={handleChange} />
      <label htmlFor="plausible">Allow Plausible tracking</label>
    </div>
  );
}
