import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const session: { user: { id: string } } | null = await getServerSession(authOptions as any);

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { semesterName } = await request.json();

    const user = await User.findById(session.user.id);
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
  const session: { user: { id: string } } | null = await getServerSession(authOptions as any);

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { semesterId } = await request.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const semesterIndex = user.semesters.findIndex(
      (semester: any) => semester._id.toString() === semesterId
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
