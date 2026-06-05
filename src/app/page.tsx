'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, Calculator, LayoutDashboard,
  TrendingUp, Menu, X, GraduationCap, Shield,
} from 'lucide-react';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

interface FeatureCardProps { icon: React.ReactNode; title: string; desc: string; delay: string; }
function FeatureCard({ icon, title, desc, delay }: FeatureCardProps) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal-on-scroll card card-hover rounded-lg p-5" style={{ transitionDelay: delay }}>
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md"
        style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  if (session) { router.push('/dashboard'); return null; }

  const features = [
    { icon: <Calculator className="h-5 w-5 text-indigo-400" />, title: 'Accurate Calculations', desc: 'Calculate SGPA & CGPA with precision based on your university grading system.' },
    { icon: <LayoutDashboard className="h-5 w-5 text-indigo-400" />, title: 'Interactive Dashboard', desc: 'A clean dashboard to manage semester-wise grades and results at a glance.' },
    { icon: <BarChart3 className="h-5 w-5 text-indigo-400" />, title: 'Performance Analysis', desc: 'Visualize your academic journey with clear charts and trend graphs.' },
    { icon: <TrendingUp className="h-5 w-5 text-indigo-400" />, title: 'Track Your Progress', desc: 'Monitor your CGPA trend over semesters and set improvement goals.' },
    { icon: <GraduationCap className="h-5 w-5 text-indigo-400" />, title: 'Multi-Semester Support', desc: 'Manage unlimited semesters with full edit, delete, and preview capabilities.' },
    { icon: <Shield className="h-5 w-5 text-indigo-400" />, title: 'Secure & Private', desc: 'Your academic data is tied to your personal account and kept private.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b backdrop-blur-sm' : 'bg-transparent'}`}
        style={{ background: scrolled ? 'var(--surface-2)' : 'transparent', borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: '#6366f1' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CGPA Calculator</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="#features" className="nav-link px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md">Features</Link>
            <Link href="/login" className="nav-link px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md">Log in</Link>
            <Link href="/register" className="btn-primary ml-2 rounded-md px-4 py-1.5 text-sm">Get Started</Link>
          </nav>

          <button id="mobile-menu-btn"
            className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-b animate-fade-down"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
            <div className="space-y-1 p-3">
              <Link href="#features" onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Features</Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Log in</Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}
                className="btn-primary block rounded-md px-3 py-2 text-sm text-center mt-1">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-20 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }} />

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground animate-fade-up stagger-1"
            style={{ borderColor: 'var(--border-default)', background: 'var(--surface-3)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
            Track smarter, achieve more
          </div>

          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up stagger-2"
            style={{ maxWidth: '780px' }}>
            Effortlessly Track Your{' '}
            <span className="text-indigo-400">Academic Progress</span>
          </h1>

          <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground animate-fade-up stagger-3">
            Calculate SGPA & CGPA with precision, visualize performance trends, and plan your academic future — all in one place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up stagger-4">
            <Link href="/register" className="btn-primary rounded-md px-6 py-2.5 text-sm font-semibold">
              Get Started — Free
            </Link>
            <Link href="#features"
              className="rounded-md border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              style={{ borderColor: 'var(--border-default)' }}>
              See Features
            </Link>
          </div>

          {/* Metrics */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-10 animate-fade-up stagger-5">
            {[{ value: '99.9%', label: 'Accuracy' }, { value: '∞', label: 'Semesters' }, { value: 'Free', label: 'Forever' }].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Everything you need</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                Built for students who care about their academic performance.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={`${i * 0.06}s`} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="mx-auto max-w-md text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ready to take control of your grades?
            </h2>
            <p className="mb-7 text-sm text-muted-foreground">
              Sign up in seconds and start managing your academic performance.
            </p>
            <Link href="/register" className="btn-primary rounded-md px-8 py-2.5 text-sm font-semibold inline-flex">
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 text-center text-xs text-muted-foreground border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <p>© {new Date().getFullYear()} CGPA Calculator. Built for students.</p>
      </footer>
    </div>
  );
}
