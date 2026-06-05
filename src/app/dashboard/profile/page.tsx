'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Eye, EyeOff, Calculator, ArrowLeft, Lock,
  BookOpen, Star, ClipboardList, Camera, Building2, Save,
  ChevronDown, GraduationCap, Award, Hash, CheckCircle2, XCircle,
  FileText, Upload, Trash2, ExternalLink,
} from 'lucide-react';
import { gradePoints } from '@/lib/gradePoints';
import { Semester, Course } from '@/lib/types';

function resizeImage(file: File, maxPx = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
  ], [password]);
  const score = checks.filter(c => c.ok).length;
  const barColor = score === 3 ? '#22c55e' : score === 2 ? '#f97316' : '#ef4444';
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? barColor : 'var(--border-default)' }} />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.ok ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
            <span style={{ color: c.ok ? '#34d399' : 'var(--muted-foreground)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [infoFetched, setInfoFetched] = useState(false);

  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [batch, setBatch] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);

  const [picture, setPicture] = useState('');
  const [picUploading, setPicUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showPw, setShowPw] = useState(false);

  // Resume
  const [resume,         setResume        ] = useState('');
  const [resumeName,     setResumeName    ] = useState('');
  const [resumeUploading,setResumeUploading] = useState(false);
  const [showPreview,    setShowPreview   ] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [conPw, setConPw] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status !== 'authenticated') return;
    fetch('/api/data').then(r => r.json()).then(d => { setSemesters(d.semesters || []); setLoadingData(false); }).catch(() => setLoadingData(false));
    fetch('/api/profile/info').then(r => r.json()).then(d => {
      setCollege(d.college || ''); setDepartment(d.department || '');
      setRollNumber(d.rollNumber || ''); setBatch(d.batch || '');
      setPicture(d.profilePicture || ''); setInfoFetched(true);
    }).catch(() => setInfoFetched(true));
    // Resume
    fetch('/api/profile/resume').then(r => r.json()).then(d => {
      setResume(d.resume || ''); setResumeName(d.resumeName || '');
    }).catch(() => {});
  }, [status, router]);

  const calcSGPA = (courses: Course[]) => {
    if (!courses.length) return 0;
    const pts = courses.reduce((a, c) => a + (gradePoints[c.grade] || 0) * c.credits, 0);
    const crs = courses.reduce((a, c) => a + c.credits, 0);
    return crs > 0 ? pts / crs : 0;
  };
  const all          = useMemo(() => semesters.flatMap(s => s.courses), [semesters]);
  const cgpa         = useMemo(() => calcSGPA(all).toFixed(2), [all]);
  const totalCreds   = useMemo(() => all.reduce((a, c) => a + c.credits, 0), [all]);
  const bestSGPA     = useMemo(() => !semesters.length ? '—' : Math.max(...semesters.map(s => calcSGPA(s.courses))).toFixed(2), [semesters]);
  const cgpaNum      = parseFloat(cgpa);
  const cgpaColor    = cgpaNum >= 9 ? '#10b981' : cgpaNum >= 8 ? '#6366f1' : cgpaNum >= 7 ? '#8b5cf6' : cgpaNum >= 5.5 ? '#f59e0b' : '#f87171';
  const cgpaLabel    = cgpaNum >= 9 ? 'Outstanding' : cgpaNum >= 8 ? 'Excellent' : cgpaNum >= 7 ? 'Good' : cgpaNum >= 5.5 ? 'Average' : cgpaNum > 0 ? 'Needs Work' : '—';

  const handlePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) { toast.error('Pick an image file'); return; }
    setPicUploading(true);
    try {
      const b64 = await resizeImage(file);
      setPicture(b64);
      const res = await fetch('/api/profile/info', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college, department, rollNumber, batch, profilePicture: b64 }) });
      if (res.ok) toast.success('Photo updated!'); else toast.error('Save failed');
    } catch { toast.error('Could not process image'); }
    finally { setPicUploading(false); }
  };

  const handleInfo = async (e: React.FormEvent) => {
    e.preventDefault(); setInfoLoading(true);
    try {
      const res = await fetch('/api/profile/info', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college, department, rollNumber, batch, profilePicture: picture }) });
      if (res.ok) toast.success('Saved!'); else toast.error('Save failed');
    } catch { toast.error('Error'); }
    finally { setInfoLoading(false); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== conPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Minimum 8 characters'); return; }
    setPwLoading(true);
    try {
      const res = await fetch('/api/profile/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }) });
      const d = await res.json();
      if (res.ok) { toast.success('Password updated!'); setCurPw(''); setNewPw(''); setConPw(''); setShowPw(false); }
      else toast.error(d.message || 'Failed');
    } catch { toast.error('Error'); }
    finally { setPwLoading(false); }
  };

  if (status === 'loading' || loadingData || !infoFetched) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="spinner" /></div>;
  }

  const name    = session?.user?.name  || 'Student';
  const email   = session?.user?.email || '';
  const initial = name.charAt(0).toUpperCase();
  const iC = 'input-clean h-10 rounded-md border text-sm text-foreground placeholder:text-muted-foreground';
  const iS = { background: 'var(--surface-3)', borderColor: 'var(--border-default)' };

  const gradeColor: Record<string, string> = { O:'#10b981','A+':'#22c55e',A:'#6366f1','B+':'#8b5cf6',B:'#06b6d4',C:'#f59e0b',D:'#f97316',F:'#f87171' };
  const gradeCounts: Record<string, number> = {};
  all.forEach(c => { gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1; });
  const gradeEntries = Object.entries(gradeCounts).sort((a,b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: '#6366f1' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">CGPA Calculator</span>
          </a>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <h1 className="text-lg font-bold text-foreground mb-6">My Profile</h1>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* ── LEFT column ── */}
          <div className="space-y-4">

            {/* Identity card */}
            <div className="card rounded-xl p-6 flex flex-col items-center text-center gap-4">
              {/* Avatar */}
              <div className="relative group">
                {picture
                  ? <img src={picture} alt="avatar" className="h-24 w-24 rounded-full object-cover" style={{ border: `3px solid ${cgpaColor}` }} />
                  : (
                    <div className="h-24 w-24 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ background: '#6366f1', border: `3px solid ${cgpaColor}` }}>
                      {initial}
                    </div>
                  )}
                <button onClick={() => fileRef.current?.click()} disabled={picUploading}
                  className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {picUploading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Camera className="h-5 w-5 text-white" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePic} />
              </div>

              <div>
                <p className="text-base font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
              </div>

              {/* CGPA pill — always on dark surface, clearly readable */}
              <div className="w-full rounded-lg py-3 px-4" style={{ background: 'var(--surface-3)', border: `1px solid ${cgpaColor}40` }}>
                <p className="text-xs text-muted-foreground mb-1">Overall CGPA</p>
                <p className="text-4xl font-bold" style={{ color: cgpaColor }}>{cgpa}</p>
                <p className="text-xs font-medium mt-1" style={{ color: cgpaColor }}>{cgpaLabel}</p>
              </div>

              {/* Meta pills */}
              <div className="w-full space-y-2">
                {college    && <div className="flex items-center gap-2 text-xs rounded-md px-3 py-2" style={{ background: 'var(--surface-3)' }}><Building2 className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" /><span className="text-foreground truncate">{college}</span></div>}
                {department && <div className="flex items-center gap-2 text-xs rounded-md px-3 py-2" style={{ background: 'var(--surface-3)' }}><GraduationCap className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" /><span className="text-foreground truncate">{department}</span></div>}
                {rollNumber && <div className="flex items-center gap-2 text-xs rounded-md px-3 py-2" style={{ background: 'var(--surface-3)' }}><Hash className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" /><span className="text-foreground">{rollNumber}</span></div>}
                {batch      && <div className="flex items-center gap-2 text-xs rounded-md px-3 py-2" style={{ background: 'var(--surface-3)' }}><BookOpen className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" /><span className="text-foreground">{batch}</span></div>}
              </div>

              <button onClick={() => fileRef.current?.click()} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                {picture ? 'Change photo' : 'Upload photo'}
              </button>
            </div>

            {/* Stats */}
            <div className="card rounded-xl p-5 grid grid-cols-2 gap-3">
              {[
                { icon: <Star className="h-4 w-4" style={{ color: cgpaColor }} />, label: 'CGPA', val: cgpa, color: cgpaColor },
                { icon: <ClipboardList className="h-4 w-4 text-indigo-400" />, label: 'Credits', val: totalCreds, color: '#818cf8' },
                { icon: <BookOpen className="h-4 w-4 text-violet-400" />, label: 'Semesters', val: semesters.length, color: '#a78bfa' },
                { icon: <Award className="h-4 w-4 text-emerald-400" />, label: 'Best SGPA', val: bestSGPA, color: '#34d399' },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3 flex flex-col gap-1" style={{ background: 'var(--surface-3)' }}>
                  {s.icon}
                  <span className="text-xl font-bold" style={{ color: s.color }}>{s.val}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT column ── */}
          <div className="space-y-4 lg:col-span-2">

            {/* Semester performance */}
            {semesters.length > 0 && (
              <div className="card rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Semester Performance</p>
                <div className="space-y-3">
                  {semesters.map(s => {
                    const sg = calcSGPA(s.courses);
                    const pct = (sg / 10) * 100;
                    const col = sg >= 8.5 ? '#34d399' : sg >= 7 ? '#6366f1' : sg >= 5.5 ? '#f59e0b' : '#f87171';
                    return (
                      <div key={s._id} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground truncate w-32 flex-shrink-0">{s.semesterName}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
                        </div>
                        <span className="text-xs font-bold w-9 text-right flex-shrink-0" style={{ color: col }}>{sg.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grade distribution */}
            {gradeEntries.length > 0 && (
              <div className="card rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Grade Distribution <span className="text-xs font-normal text-muted-foreground ml-1">({all.length} courses)</span></p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {gradeEntries.map(([grade, count]) => {
                    const col = gradeColor[grade] || '#6366f1';
                    const pct = (count / all.length) * 100;
                    return (
                      <div key={grade} className="flex items-center gap-2.5">
                        <span className="w-8 text-center text-xs font-bold rounded py-0.5 flex-shrink-0"
                          style={{ background: `${col}18`, color: col, border: `1px solid ${col}30` }}>{grade}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* College info */}
            <div className="card rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-1">College Information</p>
              <p className="text-xs text-muted-foreground mb-5">Shown on your grade preview reports</p>
              <form onSubmit={handleInfo} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">College / University</Label>
                  <Input value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. IIIT Sri City" disabled={infoLoading} className={iC} style={iS} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Department / Branch</Label>
                    <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Computer Science" disabled={infoLoading} className={iC} style={iS} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Roll Number</Label>
                    <Input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. CS22B1001" disabled={infoLoading} className={iC} style={iS} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Batch / Year</Label>
                  <Input value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. 2022 – 2026" disabled={infoLoading} className={iC} style={iS} />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={infoLoading} className="btn-primary rounded-md px-5 py-2 text-sm">
                    {infoLoading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Saving…</span></> : <><Save className="h-4 w-4" /><span>Save</span></>}
                  </button>
                </div>
              </form>
            </div>

            {/* Resume upload */}
            <div className="card rounded-xl overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <FileText className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Resume / CV</p>
                    <p className="text-xs text-muted-foreground">PDF only · max 3 MB</p>
                  </div>
                </div>
                <input ref={resumeRef} type="file" accept="application/pdf" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.type !== 'application/pdf') { toast.error('Only PDF files supported'); return; }
                    if (file.size > 3_145_728) { toast.error('File too large — max 3 MB'); return; }
                    setResumeUploading(true);
                    try {
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const b64 = ev.target!.result as string;
                        const res = await fetch('/api/profile/resume', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ resume: b64, resumeName: file.name }),
                        });
                        if (res.ok) { setResume(b64); setResumeName(file.name); toast.success('Resume uploaded!'); }
                        else toast.error('Upload failed');
                        setResumeUploading(false);
                      };
                      reader.readAsDataURL(file);
                    } catch { toast.error('Error reading file'); setResumeUploading(false); }
                  }} />
              </div>

              <div className="px-5 py-4">
                {resume ? (
                  <div className="space-y-3">
                    {/* File name row */}
                    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">{resumeName}</span>
                      </div>
                      <button onClick={async () => {
                        await fetch('/api/profile/resume', { method: 'DELETE' });
                        setResume(''); setResumeName(''); toast.success('Resume removed');
                      }} className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => setShowPreview(true)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-400/10"
                        style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                        <ExternalLink className="h-4 w-4" /> Preview
                      </button>
                      <button onClick={() => resumeRef.current?.click()} disabled={resumeUploading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                        style={{ border: '1px solid var(--border-default)' }}>
                        <Upload className="h-4 w-4" /> Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => resumeRef.current?.click()} disabled={resumeUploading}
                    className="w-full flex flex-col items-center gap-2 rounded-lg py-8 text-sm transition-colors hover:bg-muted/40"
                    style={{ border: '2px dashed var(--border-default)' }}>
                    {resumeUploading
                      ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      : <Upload className="h-6 w-6 text-muted-foreground" />}
                    <span className="text-muted-foreground">{resumeUploading ? 'Uploading…' : 'Click to upload your resume'}</span>
                    <span className="text-xs text-muted-foreground">PDF · max 3 MB</span>
                  </button>
                )}
              </div>
            </div>

            {/* Change password — toggle */}
            <div className="card rounded-xl overflow-hidden">
              <button onClick={() => setShowPw(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Lock className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showPw ? 'rotate-180' : ''}`} />
              </button>

              {showPw && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <form onSubmit={handlePwChange} className="pt-4 space-y-3">
                    {([
                      { id: 'cur', label: 'Current Password', val: curPw, set: setCurPw, show: showCur, toggle: () => setShowCur(v => !v) },
                      { id: 'new', label: 'New Password',     val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(v => !v) },
                      { id: 'con', label: 'Confirm Password', val: conPw, set: setConPw, show: showCon, toggle: () => setShowCon(v => !v) },
                    ] as const).map(f => (
                      <div key={f.id} className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">{f.label}</Label>
                        <div className="relative">
                          <Input type={f.show ? 'text' : 'password'} required value={f.val}
                            onChange={e => f.set(e.target.value)} disabled={pwLoading}
                            placeholder="••••••••" className={`${iC} pr-9`} style={iS} />
                          <button type="button" tabIndex={-1} onClick={f.toggle}
                            className="absolute inset-y-0 right-0 px-2.5 text-muted-foreground hover:text-foreground transition-colors">
                            {f.show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {f.id === 'new' && <PasswordStrength password={newPw} />}
                        {f.id === 'con' && conPw && (
                          <p className={`text-xs ${newPw === conPw ? 'text-emerald-400' : 'text-red-400'}`}>
                            {newPw === conPw ? '✓ Passwords match' : '✗ Do not match'}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
                      <button type="submit" disabled={pwLoading} className="btn-primary rounded-md px-5 py-2 text-sm">
                        {pwLoading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Updating…</span></> : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── PDF Preview Modal ── */}
      {showPreview && resume && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)' }}>
          {/* Modal toolbar */}
          <div className="flex h-14 flex-shrink-0 items-center justify-between border-b px-4"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-foreground truncate max-w-xs">{resumeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={resume} download={resumeName}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                style={{ border: '1px solid var(--border-default)' }}>
                <Upload className="h-3.5 w-3.5 rotate-180" /> Download
              </a>
              <button onClick={() => setShowPreview(false)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                style={{ border: '1px solid var(--border-default)' }}>
                ✕ Close
              </button>
            </div>
          </div>
          {/* iframe viewer */}
          <div className="flex-1 min-h-0">
            <iframe
              src={resume}
              title="Resume Preview"
              className="w-full h-full"
              style={{ border: 'none', background: '#fff' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
