'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, Trash2 } from 'lucide-react';
import { AddCourseDialog } from './AddCourseDialog';
import { gradePoints } from '@/lib/gradePoints';
import { Semester } from '@/lib/types';

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
  onDeleteSemester: (id:string) => void;
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
            <CardTitle>{semester.semesterName}</CardTitle>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onEdit(semester._id, semester.semesterName); }}
            >
              Edit
            </Button>
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
                    <Button variant="ghost" size="icon" onClick={() => onDeleteCourse(semester._id, course._id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
