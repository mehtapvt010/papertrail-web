'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

/** ----------------------------------------------------------------
 *  VaultContext
 *  - `isUnlocked`  → gate for any sensitive UI
 *  - `unlock()`    → hashes the pass-phrase with SHA-256 and stores
 *                    a session flag (nothing is persisted long-term)
 *  - `lock()`      → wipes flags (called on sign-out)
 *  -------------------------------------------------------------- */

type VaultCtx = {
  isUnlocked: boolean;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
};

const VaultContext = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setUnlocked] = useState(false);

  /** hydrate from sessionStorage on first client paint */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUnlocked(sessionStorage.getItem('vaultUnlocked') === 'true');
    }
  }, []);

  const lock = () => {
    sessionStorage.removeItem('vaultUnlocked');
    sessionStorage.removeItem('vaultPassHash');
    setUnlocked(false);
  };

  async function unlock(passphrase: string) {
    // SHA-256 hash – *purely* for “same session” verification
    const enc = new TextEncoder().encode(passphrase);
    const buf = await crypto.subtle.digest('SHA-256', enc);  // SHA-256 docs :contentReference[oaicite:1]{index=1}
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    sessionStorage.setItem('vaultUnlocked', 'true');
    sessionStorage.setItem('vaultPassHash', hex);
    setUnlocked(true);
    return true;
  }

  return (
    <VaultContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => {
  const ctx = useContext(VaultContext);                               // useContext docs :contentReference[oaicite:2]{index=2}
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
};
