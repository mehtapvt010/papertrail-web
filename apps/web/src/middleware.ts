import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from './lib/supabase/types';

export async function middleware(request: NextRequest) {
  // Refresh the Supabase session cookie (always call first)
  const response = await updateSession(request);

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.delete(name);
            response.cookies.delete(name);
          },
        },
      }
    );

    // Get current authenticated user from refreshed session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Fetch app_role from public.users table
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('app_role')
      .eq('id', user.id)
      .single();

    if (userError || userRow?.app_role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
