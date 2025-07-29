'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { gradePoints } from '@/lib/gradePoints';
import { ThemeToggle } from '@/components/ThemeToggle';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { PlusCircle, Trash2, BookOpen, Star, ClipboardList, Calculator, ChevronDown } from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { useTheme } from 'next-themes';

interface Course {
  _id: string;
  courseName: string;
  credits: number;
  grade: string;
}

interface Semester {
  _id: string;
  semesterName: string;
  courses: Course[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [newSemesterName, setNewSemesterName] = useState('');

  const [semesterName, setSemesterName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');
  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([]);

  const handleEditSemesterName = async (semesterId: string) => {
    setEditingSemesterId(semesterId);
    const semester = semesters.find(s => s._id === semesterId);
    if (semester) {
      setNewSemesterName(semester.semesterName);
    }
  };

  const handleSaveSemesterName = async () => {
    try {
      const response = await fetch('/api/semester/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semesterId: editingSemesterId,
          newSemesterName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update semester name');
      }

      toast.success('Semester name updated successfully');
      setEditingSemesterId(null);
      setNewSemesterName('');
      // Refresh semesters
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setSemesters(data.semesters || []);
      }
    } catch {
      toast.error('Failed to update semester name');
    }
  };

  const handleCancelEdit = () => {
    setEditingSemesterId(null);
    setNewSemesterName('');
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setSemesters(data.semesters || []);
      } else {
        toast.error('Failed to fetch data.');
      }
    } catch {
      toast.error('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSGPA = (courses: Course[]) => {
    if (courses.length === 0) return '0.00';
    const totalPoints = courses.reduce((acc, course) => acc + (gradePoints[course.grade] || 0) * course.credits, 0);
    const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const overallCGPA = useMemo(() => {
    const allCourses = semesters.flatMap(s => s.courses);
    if (allCourses.length === 0) return '0.00';
    return calculateSGPA(allCourses);
  }, [semesters]);

  const totalCredits = useMemo(() => {
    return semesters.flatMap(s => s.courses).reduce((acc, course) => acc + course.credits, 0);
  }, [semesters]);

  const sgpaData = useMemo(() => {
    return semesters
      .map(s => ({ name: s.semesterName, sgpa: parseFloat(calculateSGPA(s.courses)) }))
      .filter(item => !isNaN(item.sgpa));
  }, [semesters]);

  const gradeDistributionData = useMemo(() => {
    const allCourses = semesters.flatMap(s => s.courses);
    const gradeCounts = allCourses.reduce((acc, course) => {
      acc[course.grade] = (acc[course.grade] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
  }, [semesters]);

  // Theme-aware colors for charts
  const chartColors = useMemo(() => {
    return {
      primary: theme === 'dark' ? '#818cf8' : '#3b82f6', // Theme-aware primary color
      background: theme === 'dark' ? '#111827' : '#ffffff',
      text: theme === 'dark' ? '#e5e7eb' : '#1f2937',
      grid: theme === 'dark' ? '#374151' : '#e5e7eb',
      tooltipBg: theme === 'dark' ? '#1f2937' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#374151' : '#e5e7eb',
      tooltipText: theme === 'dark' ? '#ffffff' : '#1f2937',
    };
  }, [theme]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(fetch('/api/semesters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterName }) }), {
      loading: 'Adding semester...',
      success: () => { fetchData(); setSemesterName(''); setIsSemesterDialogOpen(false); return 'Semester added!'; },
      error: 'Failed to add semester.',
    });
  };

  const handleDeleteSemester = (semesterId: string) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      toast.promise(fetch('/api/semesters', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterId }) }), {
        loading: 'Deleting semester...',
        success: () => { fetchData(); return 'Semester deleted!'; },
        error: 'Failed to delete semester.',
      });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSemesterId) return;
    toast.promise(fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterId: currentSemesterId, courseName, credits: Number(credits), grade }) }), {
      loading: 'Adding course...',
      success: () => { fetchData(); setCourseName(''); setCredits(''); setGrade(''); setIsCourseDialogOpen(false); return 'Course added!'; },
      error: 'Failed to add course.',
    });
  };

  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters(prev =>
      prev.includes(semesterId)
        ? prev.filter(id => id !== semesterId)
        : [...prev, semesterId]
    );
  };

  const handleDeleteCourse = (semesterId: string, courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      toast.promise(fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ semesterId, courseId }) }), {
        loading: 'Deleting course...',
        success: () => { fetchData(); return 'Course deleted!'; },
        error: 'Failed to delete course.',
      });
    }
  };

  if (isLoading || status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-10">
          <a className="flex items-center space-x-2" href="/dashboard">
            <Calculator className="h-6 w-6" />
            <span className="font-bold text-lg">CGPA Calculator</span>
          </a>
          <div className="flex items-center justify-end space-x-4">
            {session?.user?.email && (
              <p className="text-sm text-muted-foreground">
                Welcome, {session.user.email.split('@')[0]}!
              </p>
            )}
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="group transition-transform duration-300 ease-in-out hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall CGPA</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground group-hover:animate-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallCGPA}</div>
              <p className="text-xs text-muted-foreground">Your cumulative grade point average</p>
            </CardContent>
          </Card>
          <Card className="group transition-transform duration-300 ease-in-out hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground group-hover:animate-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">Total credits earned across all semesters</p>
            </CardContent>
          </Card>
          <Card className="group transition-transform duration-300 ease-in-out hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Semesters</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground group-hover:animate-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{semesters.length}</div>
              <p className="text-xs text-muted-foreground">Total semesters recorded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card className="group transition-transform duration-300 ease-in-out hover:scale-105">
            <CardHeader>
              <CardTitle>SGPA Trend</CardTitle>
              <CardDescription>Your SGPA performance over semesters</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sgpaData}>
                  <defs>
                    <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="name" stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartColors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorder,
                      color: chartColors.tooltipText,
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Area type="monotone" dataKey="sgpa" stroke={chartColors.primary} fillOpacity={1} fill="url(#sgpaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="transition-transform duration-300 ease-in-out hover:scale-105">
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>How your grades are distributed.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart width={300} height={300}>
                  <defs>
                    {COLORS.map((color, i) => (
                      <linearGradient key={i} id={`gradeGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill={chartColors.primary}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradeGradient${index})`}
                        style={{
                          transition: 'transform 0.3s ease-in-out',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          toast.success(`Selected: ${entry.name} (${entry.value} courses)`);
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorder,
                      color: chartColors.tooltipText,
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                      color: chartColors.primary,
                    }}
                    formatter={(value: number, name: string) => {
                      const total = gradeDistributionData.reduce((sum, item) => sum + Number(item.value), 0);
                      const percentage = ((Number(value) / total) * 100).toFixed(1);
                      return [
                        `${value} (${percentage}%)`,
                        name,
                      ];
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{
                      position: 'absolute',
                      right: -5,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Semester Details</h2>
          <Dialog open={isSemesterDialogOpen} onOpenChange={setIsSemesterDialogOpen}>
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
                    onClick={() => setIsSemesterDialogOpen(false)}
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
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          {semesters.map((semester) => (
            <Card key={semester._id} className="transition-transform duration-300 ease-in-out hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  {editingSemesterId === semester._id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSemesterName}
                        onChange={(e) => setNewSemesterName(e.target.value)}
                        className="w-48"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveSemesterName}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleSemester(semester._id)}>
                          <ChevronDown className={`h-5 w-5 transition-transform ${expandedSemesters.includes(semester._id) ? 'rotate-180' : ''}`} />
                        </Button>
                        <CardTitle>{semester.semesterName}</CardTitle>
                      </div>
                      <CardDescription>SGPA: {calculateSGPA(semester.courses)}</CardDescription>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingSemesterId !== semester._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSemesterName(semester._id)}
                    >
                      Edit
                    </Button>
                  )}
                  <Dialog open={isCourseDialogOpen && currentSemesterId === semester._id} onOpenChange={(isOpen) => { if (!isOpen) setCurrentSemesterId(null); setIsCourseDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentSemesterId(semester._id)}
                        className="group"
                      >
                        <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="transition-colors group-hover:text-primary">Add Course</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] p-6">
                      <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-center">
                          Add New Course
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
                            onClick={() => setIsCourseDialogOpen(false)}
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
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteSemester(semester._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              {expandedSemesters.includes(semester._id) && (
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
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(semester._id, course._id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
