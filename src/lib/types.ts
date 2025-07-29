import { gradePoints } from '@/lib/gradePoints';

export interface Course {
  _id: string;
  courseName: string;
  credits: number;
  grade: keyof typeof gradePoints;
}

export interface Semester {
  _id: string;
  semesterName: string;
  courses: Course[];
}
