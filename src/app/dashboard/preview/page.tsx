'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Semester, Course } from '@/lib/types';
import { gradePoints } from '@/lib/gradePoints';
import { Printer, ArrowLeft, Calculator, Building2, GraduationCap, Hash, BookOpen } from 'lucide-react';
import Link from 'next/link';

const gradeColors: Record<string, string> = {
  'O': '#10b981', 'A+': '#22c55e', 'A': '#6366f1',
  'B+': '#8b5cf6', 'B': '#06b6d4', 'C': '#f59e0b',
  'D': '#f97316', 'F': '#ef4444',
};

interface ProfileInfo {
  college?: string;
  department?: string;
  rollNumber?: string;
  batch?: string;
}

function Preview() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const semesterId = searchParams.get('semesterId');
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = semesterId 
      ? `/api/semesters?semesterId=${semesterId}`
      : `/api/semesters`;

    Promise.all([
      fetch(fetchUrl).then(r => { if (!r.ok) throw new Error('Failed to fetch semesters'); return r.json(); }),
      fetch('/api/profile/info').then(r => r.ok ? r.json() : null).catch(() => null)
    ])
      .then(([semData, profData]) => {
        if (semesterId) {
          setSemesters(semData ? [semData] : []);
        } else {
          setSemesters(semData || []);
        }
        if (profData) setProfile(profData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [semesterId]);

  const calcSGPA = (courses: Course[]) => {
    if (!courses.length) return 0;
    const pts = courses.reduce((a, c) => a + (gradePoints[c.grade] || 0) * c.credits, 0);
    const crs = courses.reduce((a, c) => a + c.credits, 0);
    return crs > 0 ? pts / crs : 0;
  };

  const allCourses = useMemo(() => semesters.flatMap(s => s.courses), [semesters]);
  const totalCredits = useMemo(() => allCourses.reduce((a, c) => a + c.credits, 0), [allCourses]);
  const totalPoints = useMemo(() => allCourses.reduce((a, c) => a + (gradePoints[c.grade] || 0) * c.credits, 0), [allCourses]);
  
  const overallCgpa = useMemo(() => {
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [totalCredits, totalPoints]);

  const cgpaNum = parseFloat(overallCgpa);
  const cgpaColor = cgpaNum >= 9 ? '#10b981' : cgpaNum >= 8 ? '#6366f1' : cgpaNum >= 7 ? '#8b5cf6' : cgpaNum >= 5.5 ? '#f59e0b' : '#ef4444';
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

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

  if (semesters.length === 0) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">No academic records found.</p>
        <Link href="/dashboard" className="text-indigo-400 hover:underline text-xs flex items-center justify-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );

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

      {/* Report Card container */}
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 print:p-0 print:max-w-none">
        <div
          id="report-card"
          className="card rounded-xl overflow-hidden print:rounded-none print:border-none print:shadow-none"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)' }}
        >
          {/* Header */}
          <div className="px-8 py-8 border-b" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">
                    {semesterId ? 'Semester Grade Report' : 'Complete Academic Transcript'}
                  </p>
                  <h1 className="text-2xl font-bold text-foreground">{session?.user?.name || 'Student'}</h1>
                  <p className="text-sm text-muted-foreground">{session?.user?.email || ''}</p>
                </div>

                {/* College Info Section */}
                {profile && (profile.college || profile.department || profile.rollNumber || profile.batch) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                    {profile.college && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" /> {profile.college}
                      </span>
                    )}
                    {profile.department && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-400" /> {profile.department}
                      </span>
                    )}
                    {profile.rollNumber && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5 text-indigo-400" /> {profile.rollNumber}
                      </span>
                    )}
                    {profile.batch && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> {profile.batch}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-left md:text-right flex-shrink-0">
                <div className="text-4xl font-extrabold" style={{ color: cgpaColor }}>{overallCgpa}</div>
                <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mt-1">
                  {semesterId ? 'Semester SGPA' : 'Cumulative CGPA'}
                </div>
              </div>
            </div>
          </div>

          {/* Semesters / Courses List */}
          <div className="px-8 py-6 space-y-8">
            {semesters.map((sem) => {
              const semSg = calcSGPA(sem.courses);
              const semCreds = sem.courses.reduce((a, c) => a + c.credits, 0);
              return (
                <div key={sem._id} className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                    <h2 className="text-base font-bold text-foreground">{sem.semesterName}</h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      SGPA: <span className="text-foreground font-bold">{semSg.toFixed(2)}</span> ({semCreds} Credits)
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 text-left">Course</th>
                        <th className="pb-2 text-center w-20">Credits</th>
                        <th className="pb-2 text-center w-24">Grade</th>
                        <th className="pb-2 text-right w-24">Grade Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.courses.map((course) => {
                        const gp = gradePoints[course.grade] || 0;
                        const color = gradeColors[course.grade] || '#6366f1';
                        return (
                          <tr key={course._id} className="border-b border-default/50" style={{ borderColor: 'var(--border-subtle)' }}>
                            <td className="py-2.5 font-medium text-foreground">{course.courseName}</td>
                            <td className="py-2.5 text-center text-muted-foreground">{course.credits}</td>
                            <td className="py-2.5 text-center">
                              <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                                style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                                {course.grade}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono text-foreground">{gp}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Overall cumulative footer summary (only if multiple semesters) */}
            {semesters.length > 1 && (
              <div className="mt-8 grid grid-cols-3 gap-4 rounded-lg p-5" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Cumulative Credits</p>
                  <p className="text-lg font-bold text-foreground">{totalCredits}</p>
                </div>
                <div className="text-center border-x" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs text-muted-foreground mb-0.5">Total Grade Points</p>
                  <p className="text-lg font-bold text-foreground">{totalPoints.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Overall CGPA</p>
                  <p className="text-lg font-bold" style={{ color: cgpaColor }}>{overallCgpa}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t flex items-center justify-between" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-muted-foreground">Generated on {today}</p>
            <p className="text-xs text-muted-foreground">CGPA Calculator — cgpacalculator.app</p>
          </div>
        </div>

        {/* Print instruction note */}
        <p className="print:hidden mt-4 text-center text-xs text-muted-foreground">
          Use <kbd className="rounded border px-1 py-0.5 font-mono text-xs" style={{ borderColor: 'var(--border-default)' }}>Ctrl+P</kbd> or the button above to print/save this document.
        </p>
      </div>

      {/* Print stylesheet override */}
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
          #report-card [style*="color: #8b5cf6"],
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
