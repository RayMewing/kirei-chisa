import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import NokosOrder from '@/lib/models/NokosOrder';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    await connectDB();
    const dbOrder = await NokosOrder.findOne({ orderId, userId: authUser.userId });
    if (!dbOrder) return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan.' }, { status: 404 });

    if (dbOrder.status !== 'active')
      return NextResponse.json({ success: false, message: 'Pesanan tidak bisa dibatalkan.' }, { status: 400 });

    if (new Date() < dbOrder.cancelAllowedAt) {
      const waitSecs = Math.ceil((dbOrder.cancelAllowedAt.getTime() - Date.now()) / 1000);
      return NextResponse.json({ success: false, message: `Tunggu ${waitSecs} detik lagi untuk bisa cancel.` }, { status: 400 });
    }

    // Cancel at rumahotp
    const res = await fetch(`https://www.rumahotp.io/api/v1/orders/set_status?order_id=${orderId}&status=cancel`, {
      headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: 'Gagal membatalkan di server.' }, { status: 400 });

    dbOrder.status = 'canceled';
    await dbOrder.save();

    // Refund balance
    await User.findByIdAndUpdate(authUser.userId, { $inc: { nokosBalance: dbOrder.price } });

    return NextResponse.json({ success: true, message: `Pesanan dibatalkan. Saldo Rp${dbOrder.price.toLocaleString('id-ID')} telah dikembalikan.` });
  } catch (err) {
    console.error('Nokos cancel error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
