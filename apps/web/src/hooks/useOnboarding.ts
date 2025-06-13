'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'papertrail_onboarded_v1';

export function useOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const already = localStorage.getItem(STORAGE_KEY);
    if (!already) setOpen(true);
  }, []);

  function complete() {
    localStorage.setItem(STORAGE_KEY, 'yes');
    setOpen(false);
  }

  return { open, complete, setOpen };
}
