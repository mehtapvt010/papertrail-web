'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield, Search, Zap, Lock, FileText, Eye, Download, Share2, Sparkles, CheckCircle, Users, Globe, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              PaperTrail
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105">
              Log in
            </Link>
            <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Link href="/sign-up">Get started for free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Floating Elements */}
        <div className="absolute top-32 left-20 opacity-20 animate-float">
          <div className="w-4 h-4 bg-primary rounded-full" />
        </div>
        <div className="absolute top-40 right-32 opacity-30 animate-float delay-1000">
          <div className="w-6 h-6 bg-primary/60 rounded-full" />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-25 animate-float delay-2000">
          <div className="w-3 h-3 bg-primary/80 rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Native Document Management
              <Sparkles className="h-4 w-4" />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 animate-fade-in">
              The world&apos;s most
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                intelligent
              </span>
              <br />
              document vault
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up-delay-1">
              Experience the future of document management with AI-powered search, 
              client-side encryption, and intuitive organization. 
              <span className="text-foreground font-medium"> Your documents, your control.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up-delay-2">
              <Button size="lg" asChild className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <Link href="/sign-up">
                  Start building for free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-10 py-6 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105">
                <Link href="/sign-in">View documentation</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-slide-up-delay-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-8 animate-slide-up-delay-3">
              Trusted by teams worldwide • Enterprise-grade security
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                manage documents
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed for modern teams who need security, 
              intelligence, and simplicity in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Search</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find any document instantly with natural language search. 
                  Our AI understands context, not just keywords.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Client-Side Encryption</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your documents are encrypted before they leave your device. 
                  Only you have access to your data.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built for speed. Upload, search, and organize documents 
                  in milliseconds, not minutes.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share documents securely with your team. 
                  Control access with granular permissions.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Global Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access your documents from anywhere in the world. 
                  Works seamlessly across all devices.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Version Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track changes and maintain document history. 
                  Never lose important versions again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-32 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  See it in
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    action
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Experience the intuitive interface that makes document management 
                  feel effortless. Upload, search, and organize with just a few clicks.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Drag & drop file upload</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Instant AI-powered search</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Smart document categorization</span>
                  </div>
                </div>
                <Button size="lg" asChild className="mt-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Link href="/sign-up">
                    Try it free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative animate-slide-up-delay-1">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-2xl" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Document Vault</h3>
                        <p className="text-sm text-muted-foreground">AI-powered organization</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search documents..." 
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>

                  {/* Document List */}
                  <div className="space-y-3">
                    {[
                      { name: 'Q4 Financial Report', type: 'PDF', date: '2 hours ago', size: '2.4 MB' },
                      { name: 'Contract - Acme Corp', type: 'DOCX', date: '1 day ago', size: '1.8 MB' },
                      { name: 'Receipts Archive', type: 'ZIP', date: '3 days ago', size: '15.2 MB' },
                      { name: 'Team Photos', type: 'JPG', date: '1 week ago', size: '8.7 MB' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors duration-200">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.type} • {item.size}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative animate-slide-up-delay-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-3xl blur-2xl" />
                <div className="relative bg-card/60 backdrop-blur-sm border border-green-500/20 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-700 dark:text-green-300">Security Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Real-time protection status</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Client-side Encryption Active</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">All documents encrypted before upload</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">256-bit</div>
                        <div className="text-sm text-muted-foreground">AES Encryption</div>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 mb-1">Zero</div>
                        <div className="text-sm text-muted-foreground">Knowledge Access</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Last Security Scan</span>
                        <span className="text-sm text-green-600">2 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Threats Detected</span>
                        <span className="text-sm text-green-600">0</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Backup Status</span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="animate-fade-in">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Enterprise-grade
                  <br />
                  <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                    security
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Your documents are protected with military-grade encryption. 
                  We can&apos;t see your data, and neither can anyone else.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Zero-knowledge architecture</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>SOC 2 Type II compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>GDPR & HIPAA ready</span>
                  </div>
                </div>
                <Button size="lg" asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Link href="/sign-up">
                    Secure your documents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Ready to transform your
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                document workflow?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-slide-up-delay-1">
              Join thousands of teams who trust PaperTrail for their document management needs.
              <br />
              <span className="text-foreground font-medium">Start building today.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-slide-up-delay-2">
              <Button size="lg" asChild className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <Link href="/sign-up">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-12 py-6 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105">
                <Link href="/sign-in">View pricing</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up-delay-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">PaperTrail</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors duration-200">
                Terms of service
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors duration-200">
                Support
              </Link>
              <Link href="/docs" className="hover:text-foreground transition-colors duration-200">
                Documentation
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 PaperTrail. Built with ❤️ for modern teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
