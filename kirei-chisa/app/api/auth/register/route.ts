import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendOTPEmail, generateOTP } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password)
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi.' }, { status: 400 });

    if (username.length < 3 || username.length > 20)
      return NextResponse.json({ success: false, message: 'Username 3–20 karakter.' }, { status: 400 });

    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return NextResponse.json({ success: false, message: 'Username hanya boleh huruf, angka, dan underscore.' }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ success: false, message: 'Password minimal 6 karakter.' }, { status: 400 });

    await connectDB();

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail)
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar.' }, { status: 400 });

    const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUsername)
      return NextResponse.json({ success: false, message: 'Username sudah digunakan.' }, { status: 400 });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      otpCode: otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOTPEmail(email, otp, 'register');

    return NextResponse.json({ success: true, message: 'Kode OTP dikirim ke email kamu.', userId: user._id.toString() });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
