import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { invoice } = await req.json();
    await connectDB();
    const dbDep = await PremkuDeposit.findOne({ invoice, userId: authUser.userId });
    if (!dbDep) return NextResponse.json({ success: false, message: 'Deposit tidak ditemukan.' }, { status: 404 });
    if (dbDep.status !== 'pending')
      return NextResponse.json({ success: false, message: 'Deposit tidak bisa dibatalkan.' }, { status: 400 });

    const res = await fetch('https://premku.com/api/cancel_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, invoice }),
    });
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: data.message || 'Gagal membatalkan deposit.' }, { status: 400 });

    dbDep.status = 'canceled';
    await dbDep.save();

    return NextResponse.json({ success: true, message: 'Deposit berhasil dibatalkan.' });
  } catch (err) {
    console.error('Premku deposit cancel error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
