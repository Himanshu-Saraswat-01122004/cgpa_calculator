'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Semester } from '@/lib/types';
import { gradePoints } from '@/lib/gradePoints';
import { Printer, ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';

const gradeColors: Record<string, string> = {
  'O': '#10b981', 'A+': '#22c55e', 'A': '#6366f1',
  'B+': '#8b5cf6', 'B': '#06b6d4', 'C': '#f59e0b',
  'D': '#f97316', 'F': '#ef4444',
};

function Preview() {
  const { data: session } = useSession();
  const searchParams    = useSearchParams();
  const semesterId      = searchParams.get('semesterId');
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!semesterId) { setLoading(false); return; }
    fetch(`/api/semesters?semesterId=${semesterId}`)
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then((d)  => { setSemester(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [semesterId]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="spinner" />
    </div>
  );
  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Error: {error}</p>
    </div>
  );
  if (!semester) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">No semester data found.</p>
    </div>
  );

  const totalCredits = semester.courses.reduce((a, c) => a + c.credits, 0);
  const totalPoints  = semester.courses.reduce((a, c) => a + (gradePoints[c.grade] || 0) * c.credits, 0);
  const sgpa         = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  const sgpaNum      = parseFloat(sgpa);
  const sgpaColor    = sgpaNum >= 8.5 ? '#10b981' : sgpaNum >= 7 ? '#6366f1' : sgpaNum >= 5.5 ? '#f59e0b' : '#ef4444';
  const today        = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">

      {/* Top bar — hidden on print */}
      <div className="print:hidden border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: '#6366f1' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CGPA Calculator</span>
          </a>
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <button
              onClick={() => window.print()}
              className="btn-primary rounded-md px-4 py-2 text-sm flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report card */}
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 print:p-0 print:max-w-none">
        <div
          id="report-card"
          className="card rounded-xl overflow-hidden print:rounded-none print:border-none print:shadow-none"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)' }}
        >
          {/* Header stripe */}
          <div className="px-8 py-6 border-b" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">Grade Report</p>
                <h1 className="text-xl font-bold text-foreground">{semester.semesterName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {session?.user?.name || 'Student'} · {session?.user?.email || ''}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-3xl font-bold" style={{ color: sgpaColor }}>{sgpa}</div>
                <div className="text-xs text-muted-foreground mt-0.5">SGPA / 10</div>
              </div>
            </div>
          </div>

          {/* Course table */}
          <div className="px-8 py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credits</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weighted</th>
                </tr>
              </thead>
              <tbody>
                {semester.courses.map((course, idx) => {
                  const gp       = gradePoints[course.grade] || 0;
                  const weighted = (gp * course.credits).toFixed(1);
                  const color    = gradeColors[course.grade] || '#6366f1';
                  return (
                    <tr key={course._id}
                      className="border-b transition-colors"
                      style={{ borderColor: 'var(--border-subtle)', animationDelay: `${idx * 0.04}s` }}>
                      <td className="py-3 font-medium text-foreground">{course.courseName}</td>
                      <td className="py-3 text-center text-muted-foreground">{course.credits}</td>
                      <td className="py-3 text-center">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                          {course.grade}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono text-muted-foreground">{gp}</td>
                      <td className="py-3 text-right font-mono text-foreground">{weighted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary footer */}
            <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg p-4" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Total Credits</p>
                <p className="text-lg font-bold text-foreground">{totalCredits}</p>
              </div>
              <div className="text-center border-x" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs text-muted-foreground mb-0.5">Total Points</p>
                <p className="text-lg font-bold text-foreground">{totalPoints.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">SGPA</p>
                <p className="text-lg font-bold" style={{ color: sgpaColor }}>{sgpa}</p>
              </div>
            </div>
          </div>

          {/* Report footer */}
          <div className="px-8 py-4 border-t flex items-center justify-between" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-muted-foreground">Generated on {today}</p>
            <p className="text-xs text-muted-foreground">CGPA Calculator — cgpacalculator.app</p>
          </div>
        </div>

        {/* Print note */}
        <p className="print:hidden mt-4 text-center text-xs text-muted-foreground">
          Use <kbd className="rounded border px-1 py-0.5 font-mono text-xs" style={{ borderColor: 'var(--border-default)' }}>Ctrl+P</kbd> or the button above to save as PDF.
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #09090b !important; }
          .print\\:hidden { display: none !important; }
          #report-card {
            border: 1px solid #e4e4e7 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          #report-card * {
            color: #09090b !important;
            border-color: #e4e4e7 !important;
          }
          #report-card [style*="color: #10b981"],
          #report-card [style*="color: #6366f1"],
          #report-card [style*="color: #f59e0b"],
          #report-card [style*="color: #ef4444"] {
            color: inherit !important;
          }
          .card, #report-card {
            background: #ffffff !important;
          }
          [style*="background: var(--surface-3)"],
          [style*="background: var(--surface-2)"] {
            background: #f9f9f9 !important;
          }
        }
        @page { size: A4; margin: 1.5cm; }
      `}</style>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    }>
      <Preview />
    </Suspense>
  );
}
