import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

const PROJECT_REF = 'fzswlhzkudvhwgyqgina';
const AUTH_COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`;

export async function createClient() {
  const cookieStore = await cookies(); // no need for `await` here

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Handle access token lookup from encoded cookie
          if (name === 'sb-access-token') {
            const cookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
            if (!cookie?.startsWith('base64-')) return undefined;

            try {
              const base64 = cookie.replace(/^base64-/, '');
              const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
              return json.access_token;
            } catch {
              return undefined;
            }
          }

          // fallback for other cookies
          return cookieStore.get(name)?.value;
        },

        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // SSR restrictions — noop
          }
        },

        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // SSR restrictions — noop
          }
        },
      },
    }
  );
}
