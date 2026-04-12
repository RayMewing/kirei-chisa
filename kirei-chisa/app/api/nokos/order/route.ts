import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import NokosOrder from '@/lib/models/NokosOrder';
import { getAuthUser } from '@/lib/auth';
import { isNokosMaintenanceTime } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    if (isNokosMaintenanceTime())
      return NextResponse.json({ success: false, message: 'Layanan Nokos sedang maintenance (23:20 – 00:25 WIB). Coba lagi nanti.' }, { status: 503 });

    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { numberId, providerId, operatorId, serviceCode, serviceName, serviceImg, countryName, countryFlag, operatorName, price } = await req.json();

    if (!numberId || !providerId || !operatorId || !serviceCode || !price)
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    if (user.nokosBalance < price)
      return NextResponse.json({
        success: false,
        message: `Saldo Nokos tidak cukup. Saldo: Rp${user.nokosBalance.toLocaleString('id-ID')}, Butuh: Rp${price.toLocaleString('id-ID')}`,
      }, { status: 400 });

    // Create order at rumahotp
    const res = await fetch(
      `https://www.rumahotp.io/api/v2/orders?number_id=${numberId}&provider_id=${providerId}&operator_id=${operatorId}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();

    if (!data.success || !data.data?.order_id)
      return NextResponse.json({ success: false, message: data.message || 'Gagal membuat pesanan.' }, { status: 400 });

    const order = data.data;
    const now = Date.now();

    // Deduct balance
    user.nokosBalance -= price;
    await user.save();

    const dbOrder = await NokosOrder.create({
      userId: user._id,
      orderId: order.order_id,
      serviceCode,
      serviceName,
      serviceImg: serviceImg || '',
      countryName,
      countryFlag: countryFlag || '',
      operatorName,
      numberId,
      providerId,
      operatorId,
      phoneNumber: order.phone_number,
      price,
      status: 'active',
      expiresAt: new Date(now + 20 * 60 * 1000),   // 20 min
      refundAt: new Date(now + 20 * 60 * 1000),     // refund after 20min no OTP
      cancelAllowedAt: new Date(now + 3 * 60 * 1000), // cancel allowed after 3 min
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat! Nomor sedang menunggu OTP.',
      order: {
        id: dbOrder._id.toString(),
        orderId: order.order_id,
        phoneNumber: order.phone_number,
        serviceName,
        countryName,
        operatorName,
        price,
        status: 'active',
        expiresAt: dbOrder.expiresAt,
        cancelAllowedAt: dbOrder.cancelAllowedAt,
      },
    });
  } catch (err) {
    console.error('Nokos order error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
