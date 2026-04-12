import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import NokosDeposit from '@/lib/models/NokosDeposit';
import PremkuOrder from '@/lib/models/PremkuOrder';
import NokosOrder from '@/lib/models/NokosOrder';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();

  const [premkuDeposits, nokosDeposits, premkuOrders, nokosOrders] = await Promise.all([
    PremkuDeposit.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'username email').lean(),
    NokosDeposit.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'username email').lean(),
    PremkuOrder.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'username email').lean(),
    NokosOrder.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'username email').lean(),
  ]);

  return NextResponse.json({ success: true, premkuDeposits, nokosDeposits, premkuOrders, nokosOrders });
}

// Admin confirms delayed premku deposit manually
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { depositId, type } = await req.json();
  await connectDB();

  if (type === 'premku') {
    const dep = await PremkuDeposit.findById(depositId);
    if (!dep) return NextResponse.json({ success: false, message: 'Deposit tidak ditemukan.' }, { status: 404 });
    if (dep.status !== 'pending') return NextResponse.json({ success: false, message: 'Deposit bukan pending.' }, { status: 400 });
    dep.status = 'confirmed';
    dep.confirmedByAdmin = true;
    await dep.save();
    await User.findByIdAndUpdate(dep.userId, { $inc: { premkuBalance: dep.amount } });
    return NextResponse.json({ success: true, message: 'Deposit dikonfirmasi, saldo user telah ditambahkan.' });
  }

  return NextResponse.json({ success: false, message: 'Tipe tidak valid.' }, { status: 400 });
}
