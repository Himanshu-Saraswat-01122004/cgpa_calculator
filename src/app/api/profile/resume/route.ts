import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import User from '@/models/User';

// Allow up to 5 MB request body for base64-encoded PDF
export const runtime = 'nodejs';
export const maxDuration = 30;
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email }).select('resume resumeName');
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  return NextResponse.json({
    resume:     user.resume     || '',
    resumeName: user.resumeName || '',
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();

  try {
    const { resume, resumeName } = await request.json();

    // Must be a base64 PDF data URL or empty string
    if (resume && !resume.startsWith('data:application/pdf;base64,'))
      return NextResponse.json({ message: 'Only PDF files are supported' }, { status: 400 });

    // ~3 MB PDF ≈ 4 MB base64
    if (resume && resume.length > 4_200_000)
      return NextResponse.json({ message: 'PDF too large — max 3 MB' }, { status: 400 });

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { resume, resumeName } },
    );

    return NextResponse.json({ message: 'Resume saved' });
  } catch (err) {
    console.error('Resume save error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 });

  await dbConnect();
  await User.findOneAndUpdate({ email: session.user.email }, { $set: { resume: '', resumeName: '' } });
  return NextResponse.json({ message: 'Resume removed' });
}
