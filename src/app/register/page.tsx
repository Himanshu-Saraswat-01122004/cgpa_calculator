'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Calculator, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
  ], [password]);

  const score = checks.filter((c) => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#22c55e'];
  const labels = ['Weak Password', 'Medium Password', 'Strong Password'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2 p-2.5 rounded-lg border text-xs" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : 'var(--border-default)' }} />
        ))}
      </div>
      <p className="font-semibold text-[10px]" style={{ color: score > 0 ? colors[score - 1] : 'var(--muted-foreground)' }}>
        {score > 0 ? labels[score - 1] : ''}
      </p>
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.ok
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              : <XCircle className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
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

  const inputClass = 'input-clean h-10 rounded-lg border text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200';
  const inputStyle = { background: 'var(--surface-3)', borderColor: 'var(--border-default)' };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />

      {/* Subtle dot-grid */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      <div className="w-full max-w-sm animate-scale-pop relative z-10" style={{ animationFillMode: 'both' }}>
        <div className="card rounded-2xl p-8 relative overflow-hidden" 
          style={{ 
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)', 
            background: 'var(--surface-2)',
            borderColor: 'var(--border-subtle)'
          }}>

          {/* Sparkles pill badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-indigo-400 border border-indigo-500/20 bg-indigo-500/5">
              <Sparkles className="h-3 w-3" /> Quick Registration
            </span>
          </div>

          {/* Logo + heading */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#6366f1' }}>
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">Create account</h1>
              <p className="mt-1 text-xs text-muted-foreground">Join students tracking their academic progress</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required value={name}
                onChange={(e) => setName(e.target.value)} disabled={isLoading}
                className={inputClass} style={inputStyle} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
              <Input id="email" type="email" placeholder="name@university.edu" required value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                className={inputClass} style={inputStyle} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={password}
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
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm-password" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}
                  className={`${inputClass} w-full pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-[10px] font-semibold mt-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button id="register-submit" type="submit" disabled={isLoading}
              className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
              {isLoading
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Creating account…</span></>
                : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
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
