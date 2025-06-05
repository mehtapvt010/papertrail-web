'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { Session, SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [supabaseClient] = useState(() => supabaseBrowser());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      await supabaseClient.from('users').upsert(
        {
          id: user.id,
          email: user.email ?? '',
        },
        {
          onConflict: 'id',
        }
      );

      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session);
    };

    syncUser();
  }, [supabaseClient]);

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}
