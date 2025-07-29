import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { Types } from 'mongoose';

interface Course {
  _id?: Types.ObjectId;
  courseName: string;
  credits: number;
  grade: string;
}

interface Semester {
  _id?: Types.ObjectId;
  semesterName: string;
  courses: Course[];
}

export async function PUT(
  request: Request
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { semesterId, newSemesterName } = await request.json();
    
    if (!semesterId || !newSemesterName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const semesterIndex = user.semesters.findIndex((s: Semester) => s._id?.toString() === semesterId);
    if (semesterIndex === -1) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    user.semesters[semesterIndex].semesterName = newSemesterName;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating semester name:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
