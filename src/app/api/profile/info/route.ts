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
    'name email college department rollNumber batch profilePicture targetCGPA targetSemester bio linkedin github leetcode skills'
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
    targetCGPA:     user.targetCGPA !== undefined ? user.targetCGPA : 8.0,
    targetSemester: user.targetSemester !== undefined ? user.targetSemester : 8,
    bio:            user.bio            || '',
    linkedin:       user.linkedin       || '',
    github:         user.github         || '',
    leetcode:       user.leetcode       || '',
    skills:         user.skills         || [],
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();

  try {
    const {
      college,
      department,
      rollNumber,
      batch,
      profilePicture,
      targetCGPA,
      targetSemester,
      bio,
      linkedin,
      github,
      leetcode,
      skills,
    } = await request.json();

    // Guard: profile picture must be a data URL or empty string
    if (profilePicture && !profilePicture.startsWith('data:image/')) {
      return NextResponse.json({ message: 'Invalid image format' }, { status: 400 });
    }
    // Guard: base64 size — roughly 500 KB unencoded → ~680 KB encoded
    if (profilePicture && profilePicture.length > 700_000) {
      return NextResponse.json({ message: 'Image too large (max ~500 KB)' }, { status: 400 });
    }

    const updateData: Record<string, string | number | string[] | undefined> = {};
    if (college !== undefined) updateData.college = college;
    if (department !== undefined) updateData.department = department;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (batch !== undefined) updateData.batch = batch;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (targetCGPA !== undefined) updateData.targetCGPA = Number(targetCGPA);
    if (targetSemester !== undefined) updateData.targetSemester = Number(targetSemester);
    if (bio !== undefined) updateData.bio = bio;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (leetcode !== undefined) updateData.leetcode = leetcode;
    if (skills !== undefined) updateData.skills = skills;

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
