import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ success: false, message: 'Email dan password wajib diisi.' }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 });

    if (!user.isVerified)
      return NextResponse.json({ success: false, message: 'Akun belum diverifikasi.', userId: user._id.toString() }, { status: 403 });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 });

    const token = signToken({ userId: user._id.toString(), email: user.email, username: user.username, isAdmin: user.isAdmin });

    const res = NextResponse.json({ success: true, message: 'Login berhasil!', isAdmin: user.isAdmin });
    res.cookies.set('kc_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 3600, path: '/' });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
