import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import NokosDeposit from '@/lib/models/NokosDeposit';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { depositId } = await req.json();
    await connectDB();
    const dbDep = await NokosDeposit.findOne({ depositId, userId: authUser.userId });
    if (!dbDep) return NextResponse.json({ success: false, message: 'Deposit tidak ditemukan.' }, { status: 404 });

    if (dbDep.status === 'pending') {
      const res = await fetch(
        `https://www.rumahotp.io/api/v2/deposit/get_status?deposit_id=${depositId}`,
        { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (data.success && data.data?.status) {
        const st = data.data.status as 'success' | 'pending' | 'cancel';
        if (st === 'success') {
          dbDep.status = 'success';
          await dbDep.save();
          await User.findByIdAndUpdate(authUser.userId, { $inc: { nokosBalance: dbDep.diterima } });
        } else if (st === 'cancel') {
          dbDep.status = 'cancel';
          await dbDep.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      deposit: {
        depositId: dbDep.depositId,
        amount: dbDep.amount,
        fee: dbDep.fee,
        diterima: dbDep.diterima,
        status: dbDep.status,
        qrImage: dbDep.status === 'pending' ? dbDep.qrImage : null,
        expiredAt: dbDep.expiredAt,
        createdAt: dbDep.createdAt,
      },
    });
  } catch (err) {
    console.error('Nokos deposit status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek status.' }, { status: 500 });
  }
}
