'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, Trash2, Pencil, ExternalLink, Check, X } from 'lucide-react';
import Link from 'next/link';
import { AddCourseDialog } from './AddCourseDialog';
import { EditCourseDialog } from './EditCourseDialog';
import { gradePoints } from '@/lib/gradePoints';
import { Semester, Course } from '@/lib/types';

interface SemesterCardProps {
  semester: Semester;
  isExpanded: boolean;
  isEditing: boolean;
  newSemesterName: string;
  setNewSemesterName: (name: string) => void;
  onToggleExpand: (id: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onEdit: (id: string, name: string) => void;
  onDeleteSemester: (id: string) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
  onCourseAdded: () => void;
  isCourseDialogOpen: boolean;
  onCourseDialogOpenChange: (isOpen: boolean) => void;
}

const gradeColors: Record<string, string> = {
  'O': '#10b981', 'A+': '#22c55e', 'A': '#6366f1',
  'B+': '#8b5cf6', 'B': '#06b6d4', 'C': '#f59e0b',
  'D': '#f97316', 'F': '#ef4444',
};

export function SemesterCard({
  semester, isExpanded, isEditing, newSemesterName, setNewSemesterName,
  onToggleExpand, onSaveName, onCancelEdit, onEdit,
  onDeleteSemester, onDeleteCourse, onCourseAdded,
  isCourseDialogOpen, onCourseDialogOpenChange,
}: SemesterCardProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const totalCredits = semester.courses.reduce((acc, c) => acc + c.credits, 0);
  const totalPoints = semester.courses.reduce((acc, c) => acc + gradePoints[c.grade] * c.credits, 0);
  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  const sgpaNum = parseFloat(sgpa);
  const sgpaColor = sgpaNum >= 8.5 ? '#10b981' : sgpaNum >= 7 ? '#6366f1' : sgpaNum >= 5.5 ? '#f59e0b' : '#ef4444';

  const handleEditCourse = (course: Course) => { setEditingCourse(course); setIsEditDialogOpen(true); };
  const handleCourseUpdated = () => { setIsEditDialogOpen(false); setEditingCourse(null); onCourseAdded(); };

  return (
    <div className="card rounded-lg overflow-hidden transition-all duration-200">
      {/* ── Card Header ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors duration-200"
        onClick={() => onToggleExpand(semester._id)}
      >
        {/* Left: name + SGPA */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="input-clean h-9 w-44 rounded-md text-sm" style={{ background: 'var(--surface-3)', borderColor: 'var(--border-default)' }}
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                onClick={(e) => { e.stopPropagation(); onSaveName(); }}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <h3 className="font-bold text-base truncate">{semester.semesterName}</h3>
              <span className="shrink-0 rounded-full px-3 py-0.5 text-xs font-bold"
                style={{ background: `${sgpaColor}20`, color: sgpaColor, border: `1px solid ${sgpaColor}40` }}>
                SGPA {sgpa}
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground">
                {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Right: actions */}
        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onEdit(semester._id, semester.semesterName); }}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Rename
            </Button>
            <Link href={`/dashboard/preview?semesterId=${semester._id}`} target="_blank">
               <Button variant="outline" size="sm" className="h-8 rounded-md text-xs"
                onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview
              </Button>
            </Link>
            <AddCourseDialog semesterId={semester._id} semesterName={semester.semesterName}
              onCourseAdded={onCourseAdded} isOpen={isCourseDialogOpen} onOpenChange={onCourseDialogOpenChange} />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg"
              onClick={(e) => { e.stopPropagation(); onDeleteSemester(semester._id); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t px-5 pb-5 pt-4 animate-fade-up" style={{ borderColor: 'var(--border-subtle)', animationDuration: '0.25s', animationFillMode: 'both' }}>
          {semester.courses.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No courses added yet. Click <span className="font-semibold text-indigo-400">Add Course</span> to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent" style={{ borderColor: 'var(--border-subtle)' }}>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credits</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semester.courses.map((course, idx) => (
                  <TableRow key={course._id} className="border-b transition-colors hover:bg-muted/30"
                    style={{ borderColor: 'var(--border-subtle)', animation: `fade-slide-up 0.3s ease forwards ${idx * 0.04}s`, opacity: 0, animationFillMode: 'forwards' }}>
                    <TableCell className="font-medium text-sm py-3">{course.courseName}</TableCell>
                    <TableCell className="text-sm py-3">{course.credits}</TableCell>
                    <TableCell className="py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{ background: `${gradeColors[course.grade] || '#6366f1'}20`, color: gradeColors[course.grade] || '#6366f1', border: `1px solid ${gradeColors[course.grade] || '#6366f1'}40` }}>
                        {course.grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm py-3 font-mono">{gradePoints[course.grade]}</TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-400/10"
                          onClick={() => handleEditCourse(course)} title="Edit course">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => onDeleteCourse(semester._id, course._id)} title="Delete course">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {semester.courses.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-md px-4 py-2.5 text-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{totalCredits} credits</span></span>
              <span className="font-bold" style={{ color: sgpaColor }}>SGPA: {sgpa}</span>
            </div>
          )}
        </div>
      )}

      {editingCourse && (
        <EditCourseDialog semesterId={semester._id} course={editingCourse}
          onCourseUpdated={handleCourseUpdated} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      )}
    </div>
  );
}
