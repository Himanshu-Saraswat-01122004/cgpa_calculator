'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, Calculator, LayoutDashboard,
  TrendingUp, Menu, X, GraduationCap, Shield,
  Plus, Trash2, ArrowRight, Star, Sparkles, Code
} from 'lucide-react';
import { gradePoints } from '@/lib/gradePoints';

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
    <div ref={ref} className="reveal-on-scroll card card-hover rounded-xl p-6 relative overflow-hidden group" style={{ transitionDelay: delay }}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Quick Demo Interactive Calculator State
  const [demoCourses, setDemoCourses] = useState([
    { id: '1', name: 'Data Structures & Algorithms', credits: 4, grade: 'A' },
    { id: '2', name: 'Database Management Systems', credits: 3, grade: 'O' },
    { id: '3', name: 'Discrete Mathematics', credits: 4, grade: 'B' },
  ]);

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

  const handleUpdateGrade = (id: string, newGrade: string) => {
    setDemoCourses(prev => prev.map(c => c.id === id ? { ...c, grade: newGrade } : c));
  };

  const handleUpdateCredits = (id: string, newCredits: number) => {
    setDemoCourses(prev => prev.map(c => c.id === id ? { ...c, credits: newCredits } : c));
  };

  const handleAddCourse = () => {
    const newId = String(Date.now());
    setDemoCourses(prev => [...prev, { id: newId, name: `Course ${prev.length + 1}`, credits: 3, grade: 'A' }]);
  };

  const handleDeleteCourse = (id: string) => {
    if (demoCourses.length <= 1) return;
    setDemoCourses(prev => prev.filter(c => c.id !== id));
  };

  const demoCredits = demoCourses.reduce((acc, c) => acc + c.credits, 0);
  const demoSGPA = (() => {
    const totalPoints = demoCourses.reduce((acc, c) => acc + (gradePoints[c.grade] || 0) * c.credits, 0);
    return demoCredits > 0 ? (totalPoints / demoCredits).toFixed(2) : '0.00';
  })();

  const features = [
    { icon: <Calculator className="h-5 w-5 text-indigo-400" />, title: 'Accurate Calculations', desc: 'Calculate SGPA & CGPA with high precision based on your credits and grades.' },
    { icon: <LayoutDashboard className="h-5 w-5 text-indigo-400" />, title: 'Clean Interface', desc: 'A gorgeous dark-theme dashboard to organize semesters and review grades.' },
    { icon: <BarChart3 className="h-5 w-5 text-indigo-400" />, title: 'Performance Analysis', desc: 'Visualize your academic journey with auto-generated charts and distribution pies.' },
    { icon: <TrendingUp className="h-5 w-5 text-indigo-400" />, title: 'Pace & Trends', desc: 'View best/worst semester highlights automatically to identify where you excel.' },
    { icon: <GraduationCap className="h-5 w-5 text-indigo-400" />, title: 'Professional Profiles', desc: 'Create bio details, list your skills, and link your GitHub, LinkedIn, or LeetCode accounts.' },
    { icon: <Shield className="h-5 w-5 text-indigo-400" />, title: 'Export Ready', desc: 'Download CSV transcripts or launch A4-optimized print PDF summaries with ease.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b backdrop-blur-md bg-background/80' : 'bg-transparent'}`}
        style={{ borderColor: scrolled ? 'var(--border-subtle)' : 'transparent' }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: '#6366f1' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CGPA Calculator</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="#features" className="nav-link px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md">Features</Link>
            <Link href="/login" className="nav-link px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md">Log in</Link>
            <Link href="/register" className="btn-primary ml-2 rounded-md px-4 py-1.5 text-sm flex items-center gap-1">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          <button id="mobile-menu-btn"
            className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-b bg-background/95 backdrop-blur-md animate-fade-down"
            style={{ borderColor: 'var(--border-subtle)' }}>
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

      {/* Main Section */}
      <main>
        
        {/* Hero Section */}
        <section className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 md:pt-36 md:pb-24 lg:min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Text Column */}
          <div className="flex-1 text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground animate-fade-up stagger-1"
              style={{ borderColor: 'var(--border-default)', background: 'var(--surface-3)' }}>
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Clean, precise, and fast grade tracking</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up stagger-2"
              style={{ letterSpacing: '-0.02em' }}>
              Effortlessly Track Your{' '}
              <span className="text-indigo-400 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Academic Journey</span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-lg animate-fade-up stagger-3">
              Calculate SGPA & CGPA with absolute precision, visualize grade trends, and build a professional student profile — all in a beautiful dark interface.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 animate-fade-up stagger-4">
              <Link href="/register" className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#features"
                className="rounded-lg border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                style={{ borderColor: 'var(--border-default)' }}>
                Learn More
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="pt-8 border-t flex items-center gap-8 animate-fade-up stagger-5" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="text-xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Calculated Accuracy</p>
              </div>
              <div className="h-8 w-px bg-border-default" style={{ background: 'var(--border-subtle)' }} />
              <div>
                <p className="text-xl font-bold text-foreground">Unlimited</p>
                <p className="text-xs text-muted-foreground">Semesters & Courses</p>
              </div>
              <div className="h-8 w-px bg-border-default" style={{ background: 'var(--border-subtle)' }} />
              <div>
                <p className="text-xl font-bold text-foreground">Free</p>
                <p className="text-xs text-muted-foreground">Forever Plan</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Calculator Widget */}
          <div className="w-full lg:w-[450px] animate-scale-pop stagger-3">
            <div className="card rounded-2xl p-6 relative overflow-hidden" 
              style={{ 
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)', 
                background: 'var(--surface-2)',
                borderColor: 'var(--border-subtle)'
              }}>
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

              {/* Header Widget */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-indigo-400" /> Interactive Demo
                  </h3>
                  <p className="text-xs text-muted-foreground">Try editing the grades and credits below</p>
                </div>
                
                {/* SGPA Counter */}
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-indigo-400 tracking-tight">{demoSGPA}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Demo SGPA</div>
                </div>
              </div>

              {/* Course Inputs list */}
              <div className="space-y-3 mb-6 max-h-[260px] overflow-y-auto pr-1">
                {demoCourses.map(course => (
                  <div key={course.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-3/50 border border-default/50" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{course.name}</p>
                    </div>

                    {/* Credits select */}
                    <div className="flex-shrink-0">
                      <select 
                        value={course.credits} 
                        onChange={(e) => handleUpdateCredits(course.id, Number(e.target.value))}
                        className="bg-background text-foreground text-xs rounded border border-default p-1 focus:outline-none"
                        style={{ borderColor: 'var(--border-default)' }}
                      >
                        {[1, 2, 3, 4, 5].map(c => (
                          <option key={c} value={c}>{c} Cr</option>
                        ))}
                      </select>
                    </div>

                    {/* Grade select */}
                    <div className="flex-shrink-0">
                      <select 
                        value={course.grade} 
                        onChange={(e) => handleUpdateGrade(course.id, e.target.value)}
                        className="bg-background text-foreground text-xs font-bold rounded border border-default p-1 focus:outline-none"
                        style={{ borderColor: 'var(--border-default)' }}
                      >
                        {Object.keys(gradePoints).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      disabled={demoCourses.length <= 1}
                      className="text-muted-foreground hover:text-red-400 p-1 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Course & CTA */}
              <div className="space-y-3">
                <button 
                  onClick={handleAddCourse}
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border border-dashed border-default hover:border-indigo-400 transition-all duration-200"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <Plus className="h-4 w-4" /> Add Course
                </button>

                <Link href="/register" className="btn-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 mt-2">
                  Save My Actual Grades <Star className="h-3.5 w-3.5 fill-white/20 text-white animate-pulse" />
                </Link>
              </div>

              {/* Bottom tag */}
              <p className="text-[10px] text-center text-muted-foreground mt-4">
                Total Credits: <span className="font-semibold text-foreground">{demoCredits}</span> · Real-time local calculation
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(99,102,241,0.01)' }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Core Features</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Everything You Need To Succeed</h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Simplify your grade tracking and focus on what matters most — achieving your academic goals.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} delay={`${i * 0.05}s`} />
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-24 px-4 border-t relative overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-xl text-center space-y-6 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready to take control of your grades?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              Sign up in seconds, insert your semesters, and start visualizing your performance with beautiful charts and PDF reports.
            </p>
            <div className="pt-2">
              <Link href="/register" className="btn-primary rounded-xl px-8 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/25">
                Create Your Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-muted-foreground border-t flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <p>© {new Date().getFullYear()} CGPA Calculator. Designed with premium aesthetics for students.</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
          <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}
