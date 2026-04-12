import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();
  const users = await User.find({ isAdmin: false })
    .select('-password -otpCode -otpExpiry')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, users });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { userId, premkuBalance, nokosBalance } = await req.json();
  if (!userId) return NextResponse.json({ success: false, message: 'userId wajib.' }, { status: 400 });

  await connectDB();
  const update: Record<string, number> = {};
  if (premkuBalance !== undefined) update.premkuBalance = Math.max(0, premkuBalance);
  if (nokosBalance !== undefined) update.nokosBalance = Math.max(0, nokosBalance);

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
  if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'Saldo user berhasil diperbarui.', user });
}
