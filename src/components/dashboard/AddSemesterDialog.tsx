'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddSemesterDialogProps {
  onSemesterAdded: () => void;
}

export function AddSemesterDialog({ onSemesterAdded }: AddSemesterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [semesterName, setSemesterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.promise(
      fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterName }),
      }),
      {
        loading: 'Adding semester…',
        success: () => {
          onSemesterAdded();
          setSemesterName('');
          setIsOpen(false);
          setIsSubmitting(false);
          return 'Semester added! 🎓';
        },
        error: () => { setIsSubmitting(false); return 'Failed to add semester.'; },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="glow-btn rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Semester
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0" style={{ background: 'transparent' }}>
        <div className="glass-card animated-border rounded-2xl p-6" style={{ boxShadow: '0 25px 80px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.5)' }}>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-extrabold text-center gradient-text">
              New Semester
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">Give your semester a name to get started</p>
          </DialogHeader>

          <form onSubmit={handleAddSemester} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="semesterName" className="text-sm font-semibold text-slate-300">
                Semester Name <span className="text-red-400">*</span>
              </Label>
              <Input id="semesterName" value={semesterName} onChange={(e) => setSemesterName(e.target.value)} required
                placeholder="e.g., Semester 1 — 2024" autoFocus
                className="input-glow h-11 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 hover:text-red-400">
                Cancel
              </Button>
              <button type="submit" disabled={isSubmitting}
                className="glow-btn flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /><span>Adding…</span></> : <><PlusCircle className="h-4 w-4" /><span>Add Semester</span></>}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
