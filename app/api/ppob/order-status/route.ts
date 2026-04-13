import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PpobOrder from '@/lib/models/PpobOrder';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { transaksiId } = await req.json();
    if (!transaksiId) return NextResponse.json({ success: false, message: 'transaksiId wajib.' }, { status: 400 });

    await connectDB();
    const dbOrder = await PpobOrder.findOne({ transaksiId, userId: authUser.userId });
    if (!dbOrder) return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan.' }, { status: 404 });

    // If still processing, check remote status
    if (dbOrder.status === 'processing' || dbOrder.status === 'pending') {
      const res = await fetch(
        `https://www.rumahotp.io/api/v1/h2h/transaksi/status?transaksi_id=${transaksiId}`,
        { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
      );
      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        dbOrder.status = d.status;
        dbOrder.refund = d.refund ?? false;
        if (d.response?.available && d.response?.sn) dbOrder.sn = d.response.sn;
        if (d.tujuan_info?.available && d.tujuan_info?.name) dbOrder.targetName = d.tujuan_info.name;

        // If failed/canceled and refund is true, return nokos balance
        if ((d.status === 'failed' || d.status === 'canceled') && d.refund) {
          await User.findByIdAndUpdate(authUser.userId, { $inc: { nokosBalance: dbOrder.price } });
        }

        await dbOrder.save();
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        transaksiId: dbOrder.transaksiId,
        productName: dbOrder.productName,
        productNote: dbOrder.productNote,
        productBrand: dbOrder.productBrand,
        productCategory: dbOrder.productCategory,
        target: dbOrder.target,
        targetName: dbOrder.targetName,
        price: dbOrder.price,
        status: dbOrder.status,
        refund: dbOrder.refund,
        sn: dbOrder.sn,
        createdAt: dbOrder.createdAt,
      },
    });
  } catch (err) {
    console.error('PPOB order status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek status transaksi.' }, { status: 500 });
  }
}
