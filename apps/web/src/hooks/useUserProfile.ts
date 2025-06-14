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
      // Clear profile immediately if no session
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('name, app_role')
          .eq('id', session.user.id)
          .single();

        // Handle 406 or other errors gracefully
        if (error) {
          console.warn('Failed to fetch user profile:', error);
          setProfile(null);
        } else {
          setProfile({
            name: data?.name ?? null,
            app_role: data?.app_role ?? null,
          });
        }
      } catch (err) {
        console.warn('Error fetching user profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id, supabaseClient]); // Only depend on user ID, not entire session object

  return { profile, loading: loading || sessionLoading, setProfile };
}
