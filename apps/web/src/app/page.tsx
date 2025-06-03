'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Welcome to <span className="text-primary">PaperTrail AI</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-muted-foreground mb-2">
          Your zero-cost, privacy-first document vault powered by AI. 
        </p>
        <p className="text-lg md:text-xl max-w-2xl text-muted-foreground mb-8">
          Capture, organize, and search your receipts, IDs, contracts — instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Why PaperTrail AI?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: '🧠 Smart OCR',
                description: 'Extracts fields and metadata from documents using in-browser Tesseract.js – fully offline.',
              },
              {
                title: '🔐 Encrypted by Default',
                description: 'AES-GCM client-side encryption before upload. No plaintext touches our servers.',
              },
              {
                title: '📁 Document Vault',
                description: 'Your receipts, IDs, and files organized and searchable — forever.',
              },
              {
                title: '📦 Zero-Cost Stack',
                description: 'Runs on open-source tech and generous free-tier providers like Supabase and Vercel.',
              },
              {
                title: '🔍 Fast Vector Search',
                description: 'Search semantically by content, not just keywords, powered by pgvector + Qdrant.',
              },
              {
                title: '📱 Web-First Experience',
                description: 'Instant uploads, no native install required. Built with performance-first Next.js.',
              },
            ].map(({ title, description }, idx) => (
              <div
                key={idx}
                className="bg-background border rounded-lg p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="text-center py-10">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ using Supabase, Next.js, Tailwind, and open source.
        </p>
      </footer>
    </div>
  );
}
