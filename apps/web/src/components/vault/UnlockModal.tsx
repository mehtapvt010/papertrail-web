'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVault } from '@/providers/VaultProvider';
import toast from 'react-hot-toast';

export default function UnlockModal() {
  const { isUnlocked, unlock } = useVault();
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  if (isUnlocked) return null;

  async function handleUnlock() {
    setBusy(true);
    try {
      await unlock(pass);
      toast.success('Vault unlocked');
    } catch (e) {
      toast.error('Unable to unlock – try again');
    } finally {
      setBusy(false);
      setPass('');
    }
  }

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock your vault</DialogTitle>
        </DialogHeader>

        <Input
          type="password"
          value={pass}
          autoFocus
          placeholder="Enter session pass-phrase"
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
        />

        <DialogFooter>
          <Button onClick={handleUnlock} disabled={busy || pass.length < 4}>
            {busy ? 'Unlocking…' : 'Unlock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
