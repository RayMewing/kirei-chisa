import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendOTPEmail, generateOTP } from '@/lib/mailer';
import { signAdminToken } from '@/lib/auth';

// POST /api/auth/admin-login - step 1: send OTP to admin email
export async function POST(req: NextRequest) {
  try {
    const { email, password, otp } = await req.json();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) return NextResponse.json({ success: false, message: 'Admin email not configured.' }, { status: 500 });

    await connectDB();
    const admin = await User.findOne({ email: email?.toLowerCase(), isAdmin: true });

    if (!admin) return NextResponse.json({ success: false, message: 'Akun admin tidak ditemukan.' }, { status: 401 });

    // Step 2: verify OTP
    if (otp) {
      if (!admin.otpCode || !admin.otpExpiry || new Date() > admin.otpExpiry)
        return NextResponse.json({ success: false, message: 'OTP expired. Minta OTP baru.' }, { status: 400 });

      if (admin.otpCode !== otp.trim())
        return NextResponse.json({ success: false, message: 'Kode OTP salah.' }, { status: 400 });

      admin.otpCode = null;
      admin.otpExpiry = null;
      await admin.save();

      const token = signAdminToken({ adminId: admin._id.toString(), email: admin.email });
      const res = NextResponse.json({ success: true, message: 'Login admin berhasil!' });
      res.cookies.set('kc_admin_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 8 * 3600, path: '/' });
      return res;
    }

    // Step 1: send OTP
    const bcrypt = await import('bcryptjs');
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return NextResponse.json({ success: false, message: 'Password salah.' }, { status: 401 });

    const newOtp = generateOTP();
    admin.otpCode = newOtp;
    admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendOTPEmail(admin.email, newOtp, 'admin');
    return NextResponse.json({ success: true, step: 'otp', message: 'Kode OTP dikirim ke email admin.' });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
