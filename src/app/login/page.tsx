'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Calculator, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle dot-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      <div className="w-full max-w-sm animate-scale-pop" style={{ animationFillMode: 'both' }}>
        {/* Card */}
        <div className="card rounded-xl p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)' }}>

          {/* Logo + heading */}
          <div className="mb-7 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#6366f1' }}>
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="input-clean h-10 rounded-md border text-sm text-foreground placeholder:text-muted-foreground"
                style={{ background: 'var(--surface-3)', borderColor: 'var(--border-default)' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="input-clean h-10 w-full rounded-md border pr-10 text-sm text-foreground placeholder:text-muted-foreground"
                  style={{ background: 'var(--surface-3)', borderColor: 'var(--border-default)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full rounded-md py-2.5 text-sm mt-1"
            >
              {isLoading
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Signing in…</span></>
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
