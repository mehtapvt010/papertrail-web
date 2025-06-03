'use client';
import { PropsWithChildren, useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function SupabaseProvider({ children }: PropsWithChildren) {
  // createBrowserClient must run only once
  const [supabaseClient] = useState(() => supabaseBrowser());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
