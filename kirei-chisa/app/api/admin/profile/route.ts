import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await connectDB();
  const user = await User.findById(admin.adminId).select('-password -otpCode -otpExpiry');
  return NextResponse.json({ success: true, profile: user });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { username, currentPassword, newPassword } = await req.json();
  await connectDB();
  const user = await User.findById(admin.adminId);
  if (!user) return NextResponse.json({ success: false, message: 'Admin tidak ditemukan.' }, { status: 404 });

  if (username) user.username = username;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ success: false, message: 'Password lama wajib diisi.' }, { status: 400 });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return NextResponse.json({ success: false, message: 'Password lama salah.' }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ success: false, message: 'Password baru minimal 6 karakter.' }, { status: 400 });
    user.password = await bcrypt.hash(newPassword, 12);
  }

  await user.save();
  return NextResponse.json({ success: true, message: 'Profil admin berhasil diperbarui.' });
}
