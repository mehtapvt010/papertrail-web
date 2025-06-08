'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"          // toggles `class="dark"` on <html>
      defaultTheme="system"      // follow OS by default
      enableSystem
      disableTransitionOnChange  // avoids flicker
    >
      {children}
    </NextThemesProvider>
  );
}
