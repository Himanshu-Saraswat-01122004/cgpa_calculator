'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterName }),
      }),
      {
        loading: 'Adding semester...',
        success: () => {
          onSemesterAdded();
          setSemesterName('');
          setIsOpen(false);
          return 'Semester added!';
        },
        error: 'Failed to add semester.',
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Semester</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Semester
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            Enter the name for the new semester below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddSemester} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="semesterName" className="text-sm font-medium">
              Semester Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="semesterName"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                required
                placeholder="e.g., Fall 2024"
                className="pl-3"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-[48%] hover:bg-destructive/5 hover:text-destructive"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[48%] flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Semester
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
