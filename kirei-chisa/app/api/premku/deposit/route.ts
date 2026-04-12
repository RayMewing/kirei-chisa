import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 10000)
      return NextResponse.json({ success: false, message: 'Minimum deposit Rp10.000.' }, { status: 400 });
    if (amount > 5000000)
      return NextResponse.json({ success: false, message: 'Maksimum deposit Rp5.000.000.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    const res = await fetch('https://premku.com/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, amount }),
    });
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: data.message || 'Gagal membuat deposit.' }, { status: 400 });

    const dep = data.data;
    const dbDeposit = await PremkuDeposit.create({
      userId: user._id,
      invoice: dep.invoice,
      amount: dep.amount_req,
      totalBayar: dep.total_bayar,
      kodeUnik: dep.kode_unik,
      qrImage: dep.qr_image,
      qrRaw: dep.qr_raw,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: dbDeposit._id.toString(),
        invoice: dep.invoice,
        amount: dep.amount_req,
        totalBayar: dep.total_bayar,
        kodeUnik: dep.kode_unik,
        qrImage: dep.qr_image,
        qrRaw: dep.qr_raw,
        expiredIn: dep.expired_in,
      },
    });
  } catch (err) {
    console.error('Premku deposit error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
