'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Keep for potential future redirects or link navigation
import { supabaseBrowser } from '@/lib/supabase/browser';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const supabase = supabaseBrowser();
  const router = useRouter(); // Kept for router.push if needed for other links, or future changes
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      // You can add options here if needed, like redirect URLs or custom data
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      //   data: { full_name: 'John Doe' } // Example custom data
      // }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // Check if user object exists and if email confirmation is likely required
      // Supabase returns a user object but session is null until confirmation
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This case indicates an unconfirmed user (common with email confirmation)
        setSuccessMessage('Account created! Please check your email to confirm your registration.');
      } else if (data.user) {
         // This case might occur if email confirmation is disabled or auto-confirmed
        setSuccessMessage('Account created successfully! You can now sign in.');
        // Optionally, you could redirect to sign-in or auto-sign-in if your flow allows
        // router.push('/sign-in');
      } else {
        // Fallback, though usually covered by error or data.user
        setSuccessMessage('Sign up process initiated. Please follow any instructions sent to your email.');
      }
      setForm({ email: '', password: '' }); // Clear form on success
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={signUp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                disabled={loading || !!successMessage}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                disabled={loading || !!successMessage}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
            {!successMessage && (
              <Button disabled={loading} className="w-full">
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            )}
            <p className="pt-2 text-center text-sm">
              Already have an account? <a href="/sign-in" className="underline">Sign In</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}