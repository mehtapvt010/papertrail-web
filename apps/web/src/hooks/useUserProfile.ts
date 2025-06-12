'use client';

import { useState, useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';

type UserProfile = {
  name: string | null;
  app_role: string | null;
};

export function useUserProfile() {
  const { session, supabaseClient, isLoading: sessionLoading } = useSessionContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from('users')
        .select('name, app_role')
        .eq('id', session.user.id)
        .single();

      if (!error) {
        setProfile({
          name: data?.name ?? null,
          app_role: data?.app_role ?? null,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session, supabaseClient]);

  return { profile, loading: loading || sessionLoading };
}
