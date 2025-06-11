import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Navbar } from '../components/navbar';
import { SupabaseProvider } from '../components/supabase-provider';
import ThemeProvider from '../components/theme-provider';
import { VaultProvider } from '../providers/VaultProvider';
import { Toaster } from 'react-hot-toast';
import { WebVitals } from '../components/WebVitals';  // <-- new import

export const metadata: Metadata = {
  title: 'PaperTrail AI',
  description: 'Zero-cost, web-first document vault',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          defer
          data-domain="papertrail.local"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <SupabaseProvider>
            <VaultProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-56px)]">{children}</main>
              <WebVitals />  {/* <- pure Next.js instrumentation */}
              <Toaster />
            </VaultProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
