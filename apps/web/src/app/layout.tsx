import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Navbar } from '../components/navbar';
import { SupabaseProvider } from '../components/supabase-provider';

export const metadata: Metadata = {
  title: 'PaperTrail AI',
  description: 'Zero-cost, web-first document vault',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <SupabaseProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
