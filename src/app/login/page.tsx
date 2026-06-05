'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />

      {/* Subtle dot-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      <div className="w-full max-w-sm animate-scale-pop relative z-10" style={{ animationFillMode: 'both' }}>
        {/* Card */}
        <div className="card rounded-2xl p-8 relative overflow-hidden" 
          style={{ 
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)', 
            background: 'var(--surface-2)',
            borderColor: 'var(--border-subtle)'
          }}>

          {/* Secure Access Pill */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-indigo-400 border border-indigo-500/20 bg-indigo-500/5">
              <ShieldCheck className="h-3 w-3" /> Secure Account Access
            </span>
          </div>

          {/* Logo + heading */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#6366f1' }}>
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-xs text-muted-foreground">Sign in to resume tracking your grades</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="input-clean h-10 rounded-lg border text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
                style={{ background: 'var(--surface-3)', borderColor: 'var(--border-default)' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="input-clean h-10 w-full rounded-lg border pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
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
              className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {isLoading
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Signing in…</span></>
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign up free
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
