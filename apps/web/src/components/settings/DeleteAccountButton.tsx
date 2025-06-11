'use client';

import { Button } from '@/components/ui/button';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function DeleteAccountButton() {
  const supabase = supabaseBrowser();

  const handleDelete = async () => {
    if (!confirm('Delete account and all data? This is irreversible.')) return;

    await fetch('/api/delete-account', { method: 'POST' });
    await supabase.auth.signOut();
    location.href = '/';
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete my account
    </Button>
  );
}
