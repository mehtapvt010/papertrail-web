// apps/web/src/app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Navbar } from '../components/navbar';
import { SupabaseProvider } from '../components/supabase-provider';
import ThemeProvider from '../components/theme-provider';
import { VaultProvider } from '../providers/VaultProvider';
import { Toaster } from 'react-hot-toast';
import { WebVitals } from '../components/WebVitals';
import { ConditionalNavbar } from '../components/conditional-navbar';

export const metadata: Metadata = {
  title: 'PaperTrail AI',
  description: 'Zero-cost, web-first document vault',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Plausible self-hosted analytics */}
        <script
          defer
          data-domain="papertrail.local"
          src="https://plausible.io/js/script.js"
        />
      </head>

      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <SupabaseProvider>
            <VaultProvider>
              <ConditionalNavbar />
              <main>{children}</main>
              <WebVitals /> {/* ✅ Web Vitals instrumentation for performance */}
              <Toaster />
            </VaultProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
