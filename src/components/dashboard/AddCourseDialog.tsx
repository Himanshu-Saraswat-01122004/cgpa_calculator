'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export function AddCourseDialog({ semesterId, semesterName, onCourseAdded, isOpen, onOpenChange }: AddCourseDialogProps) {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId, courseName, credits: Number(credits), grade }),
      }),
      {
        loading: 'Adding course...',
        success: () => {
          onCourseAdded();
          setCourseName('');
          setCredits('');
          setGrade('');
          onOpenChange(false);
          return 'Course added!';
        },
        error: 'Failed to add course.',
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onOpenChange(true); }}
          className="group"
        >
          <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="transition-colors group-hover:text-primary">Add Course</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Course to {semesterName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            Enter your course details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName" className="text-sm font-medium">
              Course Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                placeholder="e.g., Computer Science Fundamentals"
                className="pl-3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits" className="text-sm font-medium">
              Credits
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="credits"
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
                min="1"
                max="5"
                className="w-24"
              />
              <p className="text-xs text-muted-foreground ml-2">
                {credits && credits !== '' ? `(${credits} credit${Number(credits) > 1 ? 's' : ''})` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium">
              Grade
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              onValueChange={setGrade}
              value={grade}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(gradePoints).map(([grade, points]) => (
                  <SelectItem key={grade} value={grade}>
                    <div className="flex items-center justify-between w-full">
                      <span>{grade}</span>
                      <span className="text-sm text-muted-foreground">{points} points</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-[48%] hover:bg-destructive/5 hover:text-destructive"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-[48%] flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
