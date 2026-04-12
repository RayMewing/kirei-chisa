import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { invoice } = await req.json();
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice wajib diisi.' }, { status: 400 });

    await connectDB();
    const dbDep = await PremkuDeposit.findOne({ invoice, userId: authUser.userId });
    if (!dbDep) return NextResponse.json({ success: false, message: 'Deposit tidak ditemukan.' }, { status: 404 });

    const res = await fetch('https://premku.com/api/pay_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, invoice }),
    });
    const data = await res.json();

    if (data.success && data.data?.status) {
      const newStatus = data.data.status as 'pending' | 'success' | 'canceled' | 'expired';
      if (dbDep.status === 'pending' && newStatus === 'success') {
        dbDep.status = 'success';
        await dbDep.save();
        // Top up user balance
        await User.findByIdAndUpdate(authUser.userId, { $inc: { premkuBalance: dbDep.amount } });
      } else if (dbDep.status !== newStatus) {
        dbDep.status = newStatus;
        await dbDep.save();
      }
    }

    return NextResponse.json({
      success: true,
      deposit: {
        invoice: dbDep.invoice,
        amount: dbDep.amount,
        totalBayar: dbDep.totalBayar,
        kodeUnik: dbDep.kodeUnik,
        qrImage: dbDep.status === 'pending' ? dbDep.qrImage : null,
        qrRaw: dbDep.status === 'pending' ? dbDep.qrRaw : null,
        status: dbDep.status,
        createdAt: dbDep.createdAt,
      },
    });
  } catch (err) {
    console.error('Premku deposit status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek status deposit.' }, { status: 500 });
  }
}
