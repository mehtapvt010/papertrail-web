'use client';

import { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation'; // Keep for potential future redirects or link navigation
import { supabaseBrowser } from '@/lib/supabase/browser';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Eye, EyeOff, Loader2, FileText, CheckCircle, Sparkles, Shield, ArrowRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  //const router = useRouter(); // Kept for router.push if needed for other links, or future changes
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
      } else {
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setSuccessMessage('Account created! Please check your email to confirm your registration.');
          toast.success('Account created! Please check your email to confirm your registration.');
        } else if (data.user) {
          setSuccessMessage('Account created successfully! You can now sign in.');
          toast.success('Account created successfully! You can now sign in.');
        } else {
          setSuccessMessage('Sign up process initiated. Please follow any instructions sent to your email.');
          toast.success('Sign up process initiated. Please follow any instructions sent to your email.');
        }
        setForm({ email: '', password: '' });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
      
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

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Join PaperTrail
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Start your journey with the world&apos;s most intelligent document vault
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Lightning Fast</span>
            </div>
          </div>
        </div>

        {/* Sign Up Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-2xl" />
          <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center font-semibold">Create Your Account</CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Get started with enterprise-grade document security
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!successMessage ? (
                <form onSubmit={signUp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={onChange}
                        className="pl-12 pr-4 py-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:bg-muted/50"
                        placeholder="Enter your email address"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={onChange}
                        className="pl-12 pr-12 py-3 bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:bg-muted/50"
                        placeholder="Create a strong password"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use at least 8 characters with a mix of letters, numbers, and symbols
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                        Create Your Account
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link 
                        href="/sign-in" 
                        className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      Account Created Successfully!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {successMessage}
                    </p>
                    <Link href="/sign-in">
                      <Button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                        <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                        Continue to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Enterprise-grade security</p>
                <p className="text-xs text-muted-foreground">Client-side encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">AI-powered search</p>
                <p className="text-xs text-muted-foreground">Find documents instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Lightning fast</p>
                <p className="text-xs text-muted-foreground">Upload & search in milliseconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Zero Knowledge
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              SOC 2 Type II
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}