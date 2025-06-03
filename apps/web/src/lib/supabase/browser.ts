'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types'; // placeholder – add typed db later

/**
 * Creates a cached Supabase browser client. Safe for React hooks.
 */
export const supabaseBrowser = () => {
  // These should ideally come from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Anon Key are required.");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}