'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield, Search, Zap, Lock, FileText, Eye, Download, Share2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">PaperTrail</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/sign-up">Get started for free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center hero-gradient">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            The world&apos;s simplest
            <br />
            <span className="text-gradient">Document Vault</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up-delay-1">
            Manage and organize your documents your way. PaperTrail is the AI-native alternative to complex and expensive document management solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up-delay-2">
            <Button size="lg" asChild className="text-lg px-8 py-6 card-hover">
              <Link href="/sign-up">
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground animate-slide-up-delay-2">Currently in beta</p>
        </div>
      </section>

      {/* Intuitive Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-4xl font-bold mb-6">Intuitive</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Imagine all the power of a document management solution without any of the complexity. With PaperTrail, your stakeholders will always find what they&apos;re looking for.
                </p>
                <Button size="lg" asChild className="card-hover">
                  <Link href="/sign-up">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative animate-slide-up-delay-1">
                <div className="bg-card border rounded-lg p-6 shadow-lg card-hover">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Document Vault</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Receipts', count: '156 items', date: '10/11/28 10:39PM' },
                      { name: 'Contracts', count: '89 items', date: '10/11/28 9:39PM' },
                      { name: 'IDs', count: '23 items', date: '10/11/28 8:39PM' },
                      { name: 'Invoices', count: '234 items', date: '10/11/28 7:39PM' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.count}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 animate-slide-up-delay-1">
                <div className="bg-card border rounded-lg p-6 shadow-lg card-hover">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Smart Search</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">Search suggestions</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span>Receipt from Starbucks</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span>Contract signed in October</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span>ID documents</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Starbucks Receipt</p>
                          <p className="text-sm text-muted-foreground">Found via AI search</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 animate-fade-in">
                <h2 className="text-4xl font-bold mb-6">Smart</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Imagine having all the features you need through an interface that just gets you. With PaperTrail, you will eliminate delivery overhead and allow your stakeholders to search, organize, and manage documents - all without having to leave the platform.
                </p>
                <Button size="lg" asChild className="card-hover">
                  <Link href="/sign-up">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safe Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-4xl font-bold mb-6">Safe</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Imagine unlocking the power of AI without having to worry about your intellectual property. With PaperTrail and our client-side encryption, we ensure your documents always stay private and secure.
                </p>
                <Button size="lg" asChild className="card-hover">
                  <Link href="/sign-up">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative animate-slide-up-delay-1">
                <div className="bg-card border rounded-lg p-6 shadow-lg card-hover">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Security & Storage</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Client-side Encryption</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">All documents encrypted before upload</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <span className="text-sm font-medium">Storage Used</span>
                        <span className="text-sm text-muted-foreground">2GB of 10GB</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <span className="text-sm font-medium">Documents</span>
                        <span className="text-sm text-muted-foreground">1,247 files</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <span className="text-sm font-medium">Last Backup</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 animate-fade-in">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up-delay-1">
              Join thousands of users who trust PaperTrail for their document management needs.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 card-hover animate-slide-up-delay-2">
              <Link href="/sign-up">
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4 animate-slide-up-delay-2">Currently in beta</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PaperTrail</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of service
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
