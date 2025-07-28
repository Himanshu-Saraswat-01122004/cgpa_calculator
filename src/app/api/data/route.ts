import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: Request) {
  const session: { user: { id: string } } | null = await getServerSession(authOptions as any);

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id).select('-password');
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
