export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NokosOrder from '@/lib/models/NokosOrder';
import PremkuOrder from '@/lib/models/PremkuOrder';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const uid = authUser.userId;

    const [nokosActive, premkuPending] = await Promise.all([
      NokosOrder.find({ userId: uid, status: 'active' }).sort({ createdAt: -1 }).lean(),
      PremkuOrder.find({ userId: uid, status: { $in: ['pending', 'processing'] } }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ success: true, nokosActive, premkuPending });
  } catch (err) {
    console.error('Active orders error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil pesanan aktif.' }, { status: 500 });
  }
}
