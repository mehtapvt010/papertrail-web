'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export default function OpenAIPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hasKey = Boolean(localStorage.getItem('openai_key'));
    setEnabled(hasKey);
  }, []);

  const handleChange = (checked: boolean) => {
    if (checked) {
      const key = prompt('Paste your OpenAI API key');
      if (key) {
        localStorage.setItem('openai_key', key);
        setEnabled(true);
      }
    } else {
      localStorage.removeItem('openai_key');
      setEnabled(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Switch id="openai" checked={enabled} onCheckedChange={handleChange} />
      <label htmlFor="openai">Use my OpenAI key (overrides Zephyr 7B)</label>
    </div>
  );
}
