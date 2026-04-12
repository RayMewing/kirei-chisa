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
    if (!orderId) return NextResponse.json({ success: false, message: 'orderId wajib diisi.' }, { status: 400 });

    await connectDB();
    const dbOrder = await NokosOrder.findOne({ orderId, userId: authUser.userId });
    if (!dbOrder) return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan.' }, { status: 404 });

    // If still active, check rumahotp
    if (dbOrder.status === 'active') {
      // Check if 20 min expired → auto refund
      if (new Date() > dbOrder.refundAt) {
        dbOrder.status = 'expired';
        // Refund
        await User.findByIdAndUpdate(authUser.userId, { $inc: { nokosBalance: dbOrder.price } });
        // Cancel at rumahotp
        await fetch(`https://www.rumahotp.io/api/v1/orders/set_status?order_id=${orderId}&status=cancel`, {
          headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' },
        }).catch(() => {});
        await dbOrder.save();
      } else {
        // Check remote status
        const res = await fetch(`https://www.rumahotp.io/api/v1/orders/get_status?order_id=${orderId}`, {
          headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const remoteStatus = data.data.status;
          if (remoteStatus === 'completed') {
            dbOrder.status = 'completed';
            dbOrder.otpCode = data.data.otp_code || null;
            dbOrder.otpMsg = data.data.otp_msg || null;
            await dbOrder.save();
          }
        }
      }
    }

    const canCancel = dbOrder.status === 'active' && new Date() >= dbOrder.cancelAllowedAt;

    return NextResponse.json({
      success: true,
      order: {
        id: dbOrder._id.toString(),
        orderId: dbOrder.orderId,
        phoneNumber: dbOrder.phoneNumber,
        serviceName: dbOrder.serviceName,
        serviceImg: dbOrder.serviceImg,
        countryName: dbOrder.countryName,
        operatorName: dbOrder.operatorName,
        price: dbOrder.price,
        status: dbOrder.status,
        otpCode: dbOrder.otpCode,
        otpMsg: dbOrder.otpMsg,
        expiresAt: dbOrder.expiresAt,
        cancelAllowedAt: dbOrder.cancelAllowedAt,
        canCancel,
        createdAt: dbOrder.createdAt,
      },
    });
  } catch (err) {
    console.error('Nokos order status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek status.' }, { status: 500 });
  }
}
