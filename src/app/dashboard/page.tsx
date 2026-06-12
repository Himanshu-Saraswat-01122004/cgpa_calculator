'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { gradePoints } from '@/lib/gradePoints';
import { ThemeToggle } from '@/components/ThemeToggle';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { BookOpen, Star, ClipboardList, Calculator, TrendingUp } from 'lucide-react';
import { AddSemesterDialog } from '@/components/dashboard/AddSemesterDialog';
import { SemesterCard } from '@/components/dashboard/SemesterCard';
import { UserNav } from '@/components/UserNav';
import { useTheme } from 'next-themes';
import { Semester, Course } from '@/lib/types';

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((ease * target).toFixed(2)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  delay: string;
}
function StatCard({ label, value, sub, icon, iconBg, delay }: StatCardProps) {
  const numericTarget = parseFloat(String(value));
  const animated = useCountUp(isNaN(numericTarget) ? 0 : numericTarget);
  const displayValue = isNaN(numericTarget) ? value : (Number.isInteger(numericTarget) ? Math.round(animated) : animated.toFixed(2));

  return (
    <div className="card rounded-lg p-5 animate-fade-up" style={{ animationDelay: delay, animationFillMode: 'both' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{displayValue}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function ChartCard({ title, desc, children, delay }: { title: string; desc: string; children: React.ReactNode; delay: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal-on-scroll card rounded-lg p-5" style={{ transitionDelay: delay }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 2, borderTopColor: '#6366f1' }} />
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [newSemesterName, setNewSemesterName] = useState('');
  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([]);

  const handleEditSemesterName = async (semesterId: string) => {
    setEditingSemesterId(semesterId);
    const semester = semesters.find((s) => s._id === semesterId);
    if (semester) setNewSemesterName(semester.semesterName);
  };

  const handleSaveSemesterName = async () => {
    try {
      const response = await fetch('/api/semester/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId: editingSemesterId, newSemesterName }),
      });
      if (!response.ok) throw new Error('Failed to update semester name');
      toast.success('Semester name updated!');
      setEditingSemesterId(null);
      setNewSemesterName('');
      const res = await fetch('/api/data');
      if (res.ok) { const data = await res.json(); setSemesters(data.semesters || []); }
    } catch { toast.error('Failed to update semester name'); }
  };

  const handleCancelEdit = () => { setEditingSemesterId(null); setNewSemesterName(''); };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) { const data = await res.json(); setSemesters(data.semesters || []); }
      else toast.error('Failed to fetch data.');
    } catch { toast.error('An error occurred while fetching data.'); }
    finally { setIsLoading(false); }
  };

  const calculateSGPA = (courses: Course[]) => {
    if (courses.length === 0) return '0.00';
    const totalPoints = courses.reduce((acc, c) => acc + (gradePoints[c.grade] || 0) * c.credits, 0);
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const overallCGPA = useMemo(() => {
    const all = semesters.flatMap((s) => s.courses);
    if (all.length === 0) return '0.00';
    return calculateSGPA(all);
  }, [semesters]);

  const totalCredits = useMemo(() => semesters.flatMap((s) => s.courses).reduce((acc, c) => acc + c.credits, 0), [semesters]);
  const sgpaData = useMemo(() => semesters.map((s) => ({ name: s.semesterName, sgpa: parseFloat(calculateSGPA(s.courses)) })).filter((i) => !isNaN(i.sgpa)), [semesters]);
  const cgpaData = useMemo(() => {
    let cumulativeCourses: Course[] = [];
    return semesters.map((s) => {
      cumulativeCourses = [...cumulativeCourses, ...s.courses];
      const cgpaVal = parseFloat(calculateSGPA(cumulativeCourses));
      return {
        name: s.semesterName,
        cgpa: isNaN(cgpaVal) ? 0 : cgpaVal,
      };
    }).filter((i) => !isNaN(i.cgpa));
  }, [semesters]);

  const gradeDistributionData = useMemo(() => {
    const all = semesters.flatMap((s) => s.courses);
    const counts = all.reduce((acc: { [k: string]: number }, c) => { acc[c.grade] = (acc[c.grade] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [semesters]);

  const isDark = theme === 'dark';
  const chartColors = useMemo(() => ({
    primary:      isDark ? '#818cf8' : '#6366f1',
    secondary:    isDark ? '#a78bfa' : '#8b5cf6',
    text:         isDark ? '#71717a' : '#71717a',
    grid:         isDark ? '#1e1e22' : '#e4e4e7',
    tooltipBg:    isDark ? '#111113' : '#ffffff',
    tooltipBorder:isDark ? '#27272a' : '#e4e4e7',
    tooltipText:  isDark ? '#f4f4f5' : '#09090b',
  }), [isDark]);

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const handleDeleteSemester = (semesterId: string) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      toast.promise(fetch('/api/semesters', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterId }) }), {
        loading: 'Deleting semester…',
        success: () => { fetchData(); return 'Semester deleted!'; },
        error: 'Failed to delete semester.',
      });
    }
  };

  const toggleSemester = (id: string) => setExpandedSemesters((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      toast.promise(fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterId, courseId }) }), {
        loading: 'Deleting course…',
        success: () => { fetchData(); return 'Course deleted!'; },
        error: 'Failed to delete course.',
      });
    }
  };

  if (isLoading || status === 'loading') return <LoadingSkeleton />;

  const username = session?.user?.name || session?.user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: '#6366f1' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CGPA Calculator</span>
          </a>
          <div className="flex items-center gap-3">
            {session?.user?.name && (
              <p className="hidden sm:block text-sm text-muted-foreground">
                Hey, <span className="font-medium text-foreground">{username}</span>
              </p>
            )}
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">

        {/* Stat cards */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Overall CGPA" value={overallCGPA} sub="Cumulative grade point average"
            icon={<Star className="h-4 w-4 text-indigo-300" />} iconBg="rgba(99,102,241,0.15)" delay="0.05s" />
          <StatCard label="Total Credits" value={totalCredits} sub="Credits earned across all semesters"
            icon={<ClipboardList className="h-4 w-4 text-violet-300" />} iconBg="rgba(139,92,246,0.15)" delay="0.10s" />
          <StatCard label="Semesters" value={semesters.length} sub="Total semesters recorded"
            icon={<BookOpen className="h-4 w-4 text-sky-300" />} iconBg="rgba(6,182,212,0.15)" delay="0.15s" />
        </div>

        {/* Charts */}
        <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ChartCard title="SGPA Trend" desc="Your performance across semesters" delay="0s">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={sgpaData}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', fontSize: 12 }} />
                <Area type="monotone" dataKey="sgpa" stroke={chartColors.primary} strokeWidth={2} fillOpacity={1} fill="url(#sgpaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="CGPA Trend" desc="Your cumulative performance trend" delay="0.03s">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cgpaData}>
                <defs>
                  <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColors.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', fontSize: 12 }} />
                <Area type="monotone" dataKey="cgpa" stroke={chartColors.secondary} strokeWidth={2} fillOpacity={1} fill="url(#cgpaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Grade Distribution" desc="How your grades are spread across courses" delay="0.06s">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={gradeDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" isAnimationActive animationDuration={800}>
                  {gradeDistributionData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.tooltipText, borderRadius: '0.5rem', fontSize: 12 }}
                  formatter={(value: number, name: string) => {
                    const total = gradeDistributionData.reduce((s, i) => s + Number(i.value), 0);
                    return [`${value} (${((Number(value) / total) * 100).toFixed(1)}%)`, name];
                  }} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Semester details */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Semester Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your courses and grades</p>
          </div>
          <AddSemesterDialog onSemesterAdded={fetchData} />
        </div>

        {semesters.length === 0 ? (
          <div className="card rounded-lg p-16 text-center empty-state">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <TrendingUp className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No semesters yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Add your first semester to start tracking your academic journey.</p>
            <AddSemesterDialog onSemesterAdded={fetchData} />
          </div>
        ) : (
          <div className="space-y-3">
            {semesters.map((semester, i) => (
              <div key={semester._id} className="reveal-on-scroll" style={{ transitionDelay: `${i * 0.06}s` }}
                ref={(el) => { if (el) { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } }, { threshold: 0.05 }); obs.observe(el); } }}>
                <SemesterCard
                  semester={semester}
                  isExpanded={expandedSemesters.includes(semester._id)}
                  isEditing={editingSemesterId === semester._id}
                  newSemesterName={newSemesterName}
                  setNewSemesterName={setNewSemesterName}
                  onToggleExpand={toggleSemester}
                  onSaveName={handleSaveSemesterName}
                  onCancelEdit={handleCancelEdit}
                  onEdit={() => handleEditSemesterName(semester._id)}
                  onDeleteSemester={handleDeleteSemester}
                  onDeleteCourse={handleDeleteCourse}
                  onCourseAdded={fetchData}
                  isCourseDialogOpen={isCourseDialogOpen && currentSemesterId === semester._id}
                  onCourseDialogOpenChange={(isOpen) => { setCurrentSemesterId(isOpen ? semester._id : null); setIsCourseDialogOpen(isOpen); }}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
