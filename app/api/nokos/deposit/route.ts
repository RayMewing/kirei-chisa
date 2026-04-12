import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import NokosDeposit from '@/lib/models/NokosDeposit';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 10000) return NextResponse.json({ success: false, message: 'Minimum deposit Rp10.000.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    const res = await fetch(
      `https://www.rumahotp.io/api/v2/deposit/create?amount=${amount}&payment_id=qris`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: data.message || 'Gagal membuat deposit.' }, { status: 400 });

    const dep = data.data;
    const dbDep = await NokosDeposit.create({
      userId: user._id,
      depositId: dep.id,
      amount: dep.total,
      fee: dep.fee,
      diterima: dep.diterima,
      paymentId: dep.method || 'qris',
      qrString: dep.qr_string || '',
      qrImage: dep.qr_image || '',
      status: 'pending',
      expiredAt: new Date(dep.expired_at_ts),
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: dbDep._id.toString(),
        depositId: dep.id,
        amount: dep.total,
        fee: dep.fee,
        diterima: dep.diterima,
        qrImage: dep.qr_image,
        qrString: dep.qr_string,
        expiredAt: dep.expired_at,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('Nokos deposit error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
