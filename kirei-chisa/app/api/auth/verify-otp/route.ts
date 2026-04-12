import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId, otp } = await req.json();
    if (!userId || !otp)
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(userId);

    if (!user)
      return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    if (user.isVerified)
      return NextResponse.json({ success: false, message: 'Akun sudah diverifikasi.' }, { status: 400 });

    if (!user.otpCode || !user.otpExpiry || new Date() > user.otpExpiry)
      return NextResponse.json({ success: false, message: 'Kode OTP expired. Minta kode baru.' }, { status: 400 });

    if (user.otpCode !== otp.trim())
      return NextResponse.json({ success: false, message: 'Kode OTP salah.' }, { status: 400 });

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email, username: user.username, isAdmin: user.isAdmin });

    const res = NextResponse.json({ success: true, message: 'Akun berhasil diverifikasi!' });
    res.cookies.set('kc_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/' });
    return res;
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
