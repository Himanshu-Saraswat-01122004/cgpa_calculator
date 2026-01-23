'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export function EditCourseDialog({ semesterId, course, onCourseUpdated, isOpen, onOpenChange }: EditCourseDialogProps) {
    const [courseName, setCourseName] = useState(course.courseName);
    const [credits, setCredits] = useState(course.credits.toString());
    const [grade, setGrade] = useState<keyof typeof gradePoints>(course.grade);

    // Update form when course prop changes
    useEffect(() => {
        setCourseName(course.courseName);
        setCredits(course.credits.toString());
        setGrade(course.grade);
    }, [course]);

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.promise(
            fetch('/api/courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semesterId,
                    courseId: course._id,
                    courseName,
                    credits: Number(credits),
                    grade
                }),
            }),
            {
                loading: 'Updating course...',
                success: () => {
                    onCourseUpdated();
                    onOpenChange(false);
                    return 'Course updated successfully!';
                },
                error: 'Failed to update course.',
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-6">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Edit Course
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center">
                        Update your course details below
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateCourse} className="space-y-4">
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
                            value={grade as string}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(gradePoints).map(([gradeKey, points]) => (
                                    <SelectItem key={gradeKey} value={gradeKey}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{gradeKey}</span>
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
                            <Pencil className="h-4 w-4" />
                            Update Course
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
