'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Calculator, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
  ], [password]);

  const score = checks.filter((c) => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#22c55e'];
  const labels = ['Weak', 'Medium', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{ background: i < score ? colors[score - 1] : 'var(--border-default)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: score > 0 ? colors[score - 1] : 'var(--muted-foreground)' }}>
        {score > 0 ? labels[score - 1] : ''}
      </p>
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.ok
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            }
            <span style={{ color: c.ok ? '#34d399' : 'var(--muted-foreground)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [name,            setName           ] = useState('');
  const [email,           setEmail          ] = useState('');
  const [password,        setPassword       ] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading,       setIsLoading      ] = useState(false);
  const [showPassword,    setShowPassword   ] = useState(false);
  const [showConfirm,     setShowConfirm    ] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        toast.success('Account created! Please log in.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Registration failed.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'input-clean h-10 rounded-md border text-sm text-foreground placeholder:text-muted-foreground';
  const inputStyle = { background: 'var(--surface-3)', borderColor: 'var(--border-default)' };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      {/* Subtle dot-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      <div className="w-full max-w-sm animate-scale-pop" style={{ animationFillMode: 'both' }}>
        <div className="card rounded-xl p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)' }}>

          {/* Logo + heading */}
          <div className="mb-7 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#6366f1' }}>
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Create account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join students tracking their grades</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required value={name}
                onChange={(e) => setName(e.target.value)} disabled={isLoading}
                className={inputClass} style={inputStyle} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                className={inputClass} style={inputStyle} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                  className={`${inputClass} w-full pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm-password" type={showConfirm ? 'text' : 'password'} required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}
                  className={`${inputClass} w-full pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button id="register-submit" type="submit" disabled={isLoading}
              className="btn-primary w-full rounded-md py-2.5 text-sm mt-1">
              {isLoading
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Creating account…</span></>
                : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
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
