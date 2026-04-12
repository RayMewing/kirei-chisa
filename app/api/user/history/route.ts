export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PremkuOrder from '@/lib/models/PremkuOrder';
import NokosOrder from '@/lib/models/NokosOrder';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import NokosDeposit from '@/lib/models/NokosDeposit';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const uid = authUser.userId;

    const [premkuOrders, nokosOrders, premkuDeposits, nokosDeposits] = await Promise.all([
      PremkuOrder.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
      NokosOrder.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
      PremkuDeposit.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
      NokosDeposit.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return NextResponse.json({ success: true, premkuOrders, nokosOrders, premkuDeposits, nokosDeposits });
  } catch (err) {
    console.error('History error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat.' }, { status: 500 });
  }
}
