import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PremkuOrder from '@/lib/models/PremkuOrder';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { invoice } = await req.json();
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice wajib diisi.' }, { status: 400 });

    await connectDB();
    const dbOrder = await PremkuOrder.findOne({ invoice, userId: authUser.userId });
    if (!dbOrder) return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan.' }, { status: 404 });

    // Check from premku API
    const res = await fetch('https://premku.com/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, invoice }),
    });
    const data = await res.json();

    if (data.success && data.status) {
      const newStatus = data.status as 'pending' | 'success' | 'failed' | 'processing';
      if (dbOrder.status !== newStatus) {
        dbOrder.status = newStatus;
        if (data.accounts) dbOrder.accounts = data.accounts;
        await dbOrder.save();
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        invoice: dbOrder.invoice,
        productName: dbOrder.productName,
        qty: dbOrder.qty,
        total: dbOrder.total,
        status: dbOrder.status,
        accounts: dbOrder.status === 'success' ? dbOrder.accounts : [],
        createdAt: dbOrder.createdAt,
      },
    });
  } catch (err) {
    console.error('Premku status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek status.' }, { status: 500 });
  }
}
