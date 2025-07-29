import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose, { Types } from 'mongoose';

interface Course {
  _id: Types.ObjectId;
  courseName: string;
  credits: number;
  grade: string;
}

interface Semester {
  _id: Types.ObjectId;
  semesterName: string;
  courses: Course[];
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { semesterId, courseName, credits, grade } = await request.json();

    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const semester = user.semesters.find(
      (s: Semester) => s._id.toString() === semesterId
    );

    if (!semester) {
      return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
    }

    const newCourse: Course = {
      _id: new mongoose.Types.ObjectId(),
      courseName,
      credits,
      grade,
    };

    semester.courses.push(newCourse);
    await user.save();

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Failed to add course:', error);
    return NextResponse.json(
      { message: 'Failed to add course' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { semesterId, courseId } = await request.json();

    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const semester = user.semesters.find(
      (s: Semester) => s._id.toString() === semesterId
    );

    if (!semester) {
      return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
    }

    const courseIndex = semester.courses.findIndex(
      (c: Course) => c._id.toString() === courseId
    );

    if (courseIndex === -1) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    semester.courses.splice(courseIndex, 1);
    await user.save();

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete course:', error);
    return NextResponse.json(
      { message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
