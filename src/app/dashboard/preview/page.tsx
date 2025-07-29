'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Semester } from '@/lib/types';
import { gradePoints } from '@/lib/gradePoints';

export default function PreviewPage() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const semesterId = searchParams.get('semesterId');
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (semesterId) {
      fetch(`/api/semesters?semesterId=${semesterId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch semester data');
          }
          return res.json();
        })
        .then((data) => {
          setSemester(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [semesterId]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  }

  if (!semester) {
    return <div className="flex items-center justify-center h-screen">No semester data found.</div>;
  }

  const totalCredits = semester.courses.reduce((acc, course) => acc + course.credits, 0);
  const totalPoints = semester.courses.reduce((acc, course) => acc + gradePoints[course.grade] * course.credits, 0);
  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl p-8 m-4 bg-white dark:bg-gray-800 shadow-lg text-black dark:text-white" id="certificate">
        <div className="border-4 border-black dark:border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Indian Institute of Information Technology Sri City</h1>
            <p className="text-2xl mt-2">Grade Certificate</p>
          </div>
          <div className="flex justify-between mb-8">
            <div>
              <p className="font-semibold">Student Name:</p>
              <p>{session?.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Semester:</p>
              <p>{semester.semesterName}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semester.courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.grade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-end mt-16">
            <div>
              <p className="font-semibold">Date of Issue:</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Total Credits: {totalCredits}</p>
              <p className="text-lg font-semibold">SGPA: {sgpa}</p>
            </div>
          </div>
          <div className="flex justify-end mt-24">
            <div className="text-center">
              <p className="border-t border-gray-400 pt-2">Controller of Examinations</p>
            </div>
          </div>
        </div>
      </div>
      <Button onClick={handlePrint} className="mt-4 print:hidden">
        Print Certificate
      </Button>

      <style jsx global>{`
        @media print {
          body {
            background-color: #fff;
          }
          .print-button {
            display: none;
          }
          #certificate {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 1.5rem;
            box-shadow: none;
            background: white;
            color: black;
          }
          #certificate .dark\:bg-gray-800 {
            background-color: white !important;
          }
          #certificate .dark\:text-white {
            color: black !important;
          }
           #certificate .dark\:border-gray-200 {
            border-color: black !important;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
