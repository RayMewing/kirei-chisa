import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    if (dbDep.status !== 'pending') return NextResponse.json({ success: false, message: 'Deposit tidak bisa dibatalkan.' }, { status: 400 });

    const res = await fetch(
      `https://www.rumahotp.io/api/v1/deposit/cancel?deposit_id=${depositId}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: 'Gagal membatalkan deposit.' }, { status: 400 });

    dbDep.status = 'cancel';
    await dbDep.save();

    return NextResponse.json({ success: true, message: 'Deposit berhasil dibatalkan.' });
  } catch (err) {
    console.error('Nokos deposit cancel error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
