import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
        const user = await User.findById((session.user as { id: string }).id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
