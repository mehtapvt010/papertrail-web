'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword(form);
    if (error) setError(error.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required onChange={onChange} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={onChange}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
            <p className="pt-2 text-center text-sm">
              New? <a href="/sign-up" className="underline">Create account</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
