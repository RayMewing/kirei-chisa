import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();

    // Kamu bisa ganti email dan password ini sesuai keinginan
    const email = 'ganzvlty@gmail.com';
    const password = 'ganzvlty';

    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin sudah ada di database!',
        email: email
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    
    await User.create({ 
      username: 'admin', 
      email: email, 
      password: hashed, 
      isVerified: true, 
      isAdmin: true 
    });

    return NextResponse.json({ 
      success: true, 
      message: '✅ Berhasil! Akun Admin berhasil dibuat.',
      email: email,
      password: password
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat admin.' }, { status: 500 });
  }
}
