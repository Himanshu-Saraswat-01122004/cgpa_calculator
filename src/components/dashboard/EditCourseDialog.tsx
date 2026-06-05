'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { gradePoints } from '@/lib/gradePoints';
import { Course } from '@/lib/types';

interface EditCourseDialogProps {
  semesterId: string;
  course: Course;
  onCourseUpdated: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const gradeColors: Record<string, string> = {
  'O': '#10b981', 'A+': '#22c55e', 'A': '#6366f1',
  'B+': '#8b5cf6', 'B': '#06b6d4', 'C': '#f59e0b',
  'D': '#f97316', 'F': '#ef4444',
};

export function EditCourseDialog({ semesterId, course, onCourseUpdated, isOpen, onOpenChange }: EditCourseDialogProps) {
  const [courseName, setCourseName] = useState(course.courseName);
  const [credits, setCredits] = useState(course.credits.toString());
  const [grade, setGrade] = useState<keyof typeof gradePoints>(course.grade);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCourseName(course.courseName);
    setCredits(course.credits.toString());
    setGrade(course.grade);
  }, [course]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.promise(
      fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId, courseId: course._id, courseName, credits: Number(credits), grade }),
      }),
      {
        loading: 'Updating course…',
        success: () => { onCourseUpdated(); onOpenChange(false); setIsSubmitting(false); return 'Course updated! ✅'; },
        error: () => { setIsSubmitting(false); return 'Failed to update course.'; },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0" style={{ background: 'transparent' }}>
        <div className="glass-card animated-border rounded-2xl p-6" style={{ boxShadow: '0 25px 80px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.5)' }}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-extrabold text-center gradient-text">Edit Course</DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">Update your course details below</p>
          </DialogHeader>

          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-courseName" className="text-sm font-semibold text-slate-300">
                Course Name <span className="text-red-400">*</span>
              </Label>
              <Input id="edit-courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} required
                placeholder="e.g., Data Structures"
                className="input-glow h-11 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-credits" className="text-sm font-semibold text-slate-300">
                Credits <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <Input id="edit-credits" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} required
                  min="1" max="8"
                  className="input-glow h-11 w-24 rounded-xl border-white/10 bg-white/5 text-foreground" />
                {credits && (
                  <span className="text-sm text-muted-foreground">{credits} credit{Number(credits) > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-grade" className="text-sm font-semibold text-slate-300">
                Grade <span className="text-red-400">*</span>
              </Label>
              <Select onValueChange={setGrade} value={grade as string}>
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

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 hover:text-red-400">
                Cancel
              </Button>
              <button type="submit" disabled={isSubmitting}
                className="glow-btn flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Saving…</span></> : <><Pencil className="h-4 w-4" /><span>Update Course</span></>}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
