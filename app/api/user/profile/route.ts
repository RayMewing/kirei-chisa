import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const authUser = getAuthUser();
  if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findById(authUser.userId).select('-password -otpCode -otpExpiry');
  if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      premkuBalance: user.premkuBalance,
      nokosBalance: user.nokosBalance,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
}
