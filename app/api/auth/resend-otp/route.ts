import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendOTPEmail, generateOTP } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ success: false, message: 'Akun sudah diverifikasi.' }, { status: 400 });

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp, 'register');

    return NextResponse.json({ success: true, message: 'Kode OTP baru telah dikirim.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal kirim OTP.' }, { status: 500 });
  }
}
