'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, Trash2, Pencil } from 'lucide-react';
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

export function SemesterCard({
  semester,
  isExpanded,
  isEditing,
  newSemesterName,
  setNewSemesterName,
  onToggleExpand,
  onSaveName,
  onCancelEdit,
  onEdit,
  onDeleteSemester,
  onDeleteCourse,
  onCourseAdded,
  isCourseDialogOpen,
  onCourseDialogOpenChange,
}: SemesterCardProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const totalCredits = semester.courses.reduce((acc, course) => acc + course.credits, 0);
  const totalPoints = semester.courses.reduce((acc, course) => acc + gradePoints[course.grade] * course.credits, 0);
  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleCourseUpdated = () => {
    setIsEditDialogOpen(false);
    setEditingCourse(null);
    onCourseAdded(); // Reuse the same callback to refresh data
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => onToggleExpand(semester._id)}>
        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="w-48"
                onClick={(e) => e.stopPropagation()} // Prevent card from toggling
              />
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onSaveName(); }}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <CardTitle>{semester.semesterName}</CardTitle>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">(SGPA: {sgpa})</span>
            </div>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onEdit(semester._id, semester.semesterName); }}
              >
                Edit
              </Button>
              <Link href={`/dashboard/preview?semesterId=${semester._id}`} passHref target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Preview
                </Button>
              </Link>
            </>
          )}
          <AddCourseDialog
            semesterId={semester._id}
            semesterName={semester.semesterName}
            onCourseAdded={onCourseAdded}
            isOpen={isCourseDialogOpen}
            onOpenChange={onCourseDialogOpenChange}
          />
          <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteSemester(semester._id); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semester.courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.grade}</TableCell>
                  <TableCell>{gradePoints[course.grade]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCourse(course)}
                        title="Edit course"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteCourse(semester._id, course._id)}
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
      {editingCourse && (
        <EditCourseDialog
          semesterId={semester._id}
          course={editingCourse}
          onCourseUpdated={handleCourseUpdated}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </Card>
  );
}
