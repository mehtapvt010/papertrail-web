// apps/web/src/middleware.ts

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import type { Database } from './lib/supabase/types';  // adjust if needed

export async function middleware(request: NextRequest) {
  // Refresh session globally on every request
  const response = await updateSession(request);

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options) {
            request.cookies.delete(name);
            response.cookies.delete(name);
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('app_role')
      .eq('id', user.id)
      .single();

    if (userRow?.app_role !== 'admin') {
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
