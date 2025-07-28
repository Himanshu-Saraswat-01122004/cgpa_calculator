import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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

    const semesterIndex = user.semesters.findIndex(s => s._id?.toString() === semesterId);
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
