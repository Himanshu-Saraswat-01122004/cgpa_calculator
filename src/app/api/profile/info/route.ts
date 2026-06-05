import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email }).select(
    'name email college department rollNumber batch profilePicture'
  );
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  return NextResponse.json({
    name:           user.name,
    email:          user.email,
    college:        user.college        || '',
    department:     user.department     || '',
    rollNumber:     user.rollNumber     || '',
    batch:          user.batch          || '',
    profilePicture: user.profilePicture || '',
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();

  try {
    const { college, department, rollNumber, batch, profilePicture } = await request.json();

    // Guard: profile picture must be a data URL or empty string
    if (profilePicture && !profilePicture.startsWith('data:image/')) {
      return NextResponse.json({ message: 'Invalid image format' }, { status: 400 });
    }
    // Guard: base64 size — roughly 500 KB unencoded → ~680 KB encoded
    if (profilePicture && profilePicture.length > 700_000) {
      return NextResponse.json({ message: 'Image too large (max ~500 KB)' }, { status: 400 });
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { college, department, rollNumber, batch, profilePicture } },
      { new: true }
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
