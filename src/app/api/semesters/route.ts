import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose, { Types } from 'mongoose';

interface Course {
  _id?: Types.ObjectId;
  courseName: string;
  credits: number;
  grade: string;
}

interface Semester {
  _id: Types.ObjectId;
  semesterName: string;
  courses: Course[];
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const semesterId = request.nextUrl.searchParams.get('semesterId');

    if (semesterId) {
      const semester = user.semesters.find(
        (s: Semester) => s._id.toString() === semesterId
      );
      if (!semester) {
        return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
      }
      return NextResponse.json(semester, { status: 200 });
    } else {
      return NextResponse.json(user.semesters, { status: 200 });
    }
  } catch (error) {
    console.error('Failed to fetch semesters:', error);
    return NextResponse.json(
      { message: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { semesterName } = await request.json();

    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newSemester = {
      _id: new mongoose.Types.ObjectId(),
      semesterName,
      courses: [],
    };

    user.semesters.push(newSemester);
    await user.save();

    return NextResponse.json(newSemester, { status: 201 });
  } catch (error) {
    console.error('Failed to add semester:', error);
    return NextResponse.json(
      { message: 'Failed to add semester' },
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
    const { semesterId } = await request.json();

    const user = await User.findById((session.user as { id: string }).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const semesterIndex = user.semesters.findIndex(
      (semester: Semester) => semester._id.toString() === semesterId
    );

    if (semesterIndex === -1) {
      return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
    }

    user.semesters.splice(semesterIndex, 1);
    await user.save();

    return NextResponse.json({ message: 'Semester deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete semester:', error);
    return NextResponse.json(
      { message: 'Failed to delete semester' },
      { status: 500 }
    );
  }
}
