// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Standard import
import type { Database } from './types'; // Adjust path to your Database type definition if needed

// This function is now 'async' to allow 'await' for cookies().
export async function createClient() {
  // If your TypeScript environment consistently sees 'cookies()' as returning a Promise,
  // you must 'await' its result to get the actual cookie store object.
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 'cookieStore' is now the resolved object after 'await'.
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // 'cookieStore' is the resolved object.
            cookieStore.set(name, value, options);
          } catch (error) {
            // Cookies cannot be set directly from Server Components.
            // This should ideally be called from a Server Action or Route Handler.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // 'cookieStore' is the resolved object.
            // This also uses the corrected signature for delete.
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Cookies cannot be removed directly from Server Components.
            // This should ideally be called from a Server Action or Route Handler.
          }
        },
      },
    }
  );
}