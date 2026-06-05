'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { gradePoints } from '@/lib/gradePoints';

interface AddCourseDialogProps {
  semesterId: string;
  semesterName: string;
  onCourseAdded: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const gradeColors: Record<string, string> = {
  'O': '#10b981', 'A+': '#22c55e', 'A': '#6366f1',
  'B+': '#8b5cf6', 'B': '#06b6d4', 'C': '#f59e0b',
  'D': '#f97316', 'F': '#ef4444',
};

export function AddCourseDialog({ semesterId, semesterName, onCourseAdded, isOpen, onOpenChange }: AddCourseDialogProps) {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.promise(
      fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId, courseName, credits: Number(credits), grade }),
      }),
      {
        loading: 'Adding course…',
        success: () => {
          onCourseAdded();
          setCourseName(''); setCredits(''); setGrade('');
          onOpenChange(false); setIsSubmitting(false);
          return 'Course added! 🎉';
        },
        error: () => { setIsSubmitting(false); return 'Failed to add course.'; },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs border-white/10 hover:border-indigo-500/40 hover:text-indigo-400 group"
          onClick={(e) => { e.stopPropagation(); onOpenChange(true); }}>
          <PlusCircle className="h-3.5 w-3.5 mr-1 transition-transform group-hover:rotate-90 duration-300" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0" style={{ background: 'transparent' }}>
        <div className="glass-card animated-border rounded-2xl p-6" style={{ boxShadow: '0 25px 80px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.5)' }}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-extrabold text-center gradient-text">
              Add Course
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">{semesterName}</p>
          </DialogHeader>

          <form onSubmit={handleAddCourse} className="space-y-4">
            {/* Course name */}
            <div className="space-y-1.5">
              <Label htmlFor="add-courseName" className="text-sm font-semibold text-slate-300">
                Course Name <span className="text-red-400">*</span>
              </Label>
              <Input id="add-courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} required
                placeholder="e.g., Data Structures"
                className="input-glow h-11 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground" />
            </div>

            {/* Credits */}
            <div className="space-y-1.5">
              <Label htmlFor="add-credits" className="text-sm font-semibold text-slate-300">
                Credits <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <Input id="add-credits" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} required
                  min="1" max="8"
                  className="input-glow h-11 w-24 rounded-xl border-white/10 bg-white/5 text-foreground" />
                {credits && (
                  <span className="text-sm text-muted-foreground">
                    {credits} credit{Number(credits) > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Grade */}
            <div className="space-y-1.5">
              <Label htmlFor="add-grade" className="text-sm font-semibold text-slate-300">
                Grade <span className="text-red-400">*</span>
              </Label>
              <Select onValueChange={setGrade} value={grade}>
                <SelectTrigger className="input-glow h-11 rounded-xl border-white/10 bg-white/5">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 rounded-xl">
                  {Object.entries(gradePoints).map(([g, pts]) => (
                    <SelectItem key={g} value={g} className="cursor-pointer rounded-lg my-0.5 focus:bg-white/10">
                      <div className="flex items-center gap-3 w-full">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ background: `${gradeColors[g] || '#6366f1'}20`, color: gradeColors[g] || '#6366f1', border: `1px solid ${gradeColors[g] || '#6366f1'}40` }}>
                          {g}
                        </span>
                        <span className="text-muted-foreground text-sm">{pts} points</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 hover:text-red-400">
                Cancel
              </Button>
              <button type="submit" disabled={isSubmitting}
                className="glow-btn flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Adding…</span></> : <><PlusCircle className="h-4 w-4" /><span>Add Course</span></>}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
