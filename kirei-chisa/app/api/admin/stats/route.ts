import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuOrder from '@/lib/models/PremkuOrder';
import NokosOrder from '@/lib/models/NokosOrder';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import NokosDeposit from '@/lib/models/NokosDeposit';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();

  const [
    totalUsers,
    totalPremkuOrders,
    totalNokosOrders,
    premkuRevenue,
    nokosRevenue,
    pendingDeposits,
  ] = await Promise.all([
    User.countDocuments({ isAdmin: false }),
    PremkuOrder.countDocuments(),
    NokosOrder.countDocuments(),
    PremkuDeposit.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    NokosDeposit.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$diterima' } } }]),
    PremkuDeposit.countDocuments({ status: 'pending' }),
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers,
      totalOrders: totalPremkuOrders + totalNokosOrders,
      totalPremkuOrders,
      totalNokosOrders,
      premkuRevenue: premkuRevenue[0]?.total ?? 0,
      nokosRevenue: nokosRevenue[0]?.total ?? 0,
      pendingDeposits,
    },
  });
}
