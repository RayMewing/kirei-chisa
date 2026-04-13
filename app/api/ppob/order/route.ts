import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PpobOrder from '@/lib/models/PpobOrder';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { productCode, productName, productNote, productType, productBrand, productCategory, target, targetName, price } = await req.json();

    if (!productCode || !target || !price)
      return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    if (user.nokosBalance < price)
      return NextResponse.json({
        success: false,
        message: `Saldo Nokos tidak cukup. Saldo: Rp${user.nokosBalance.toLocaleString('id-ID')}, Butuh: Rp${price.toLocaleString('id-ID')}`,
      }, { status: 400 });

    // Create transaction at rumahotp h2h
    const res = await fetch(
      `https://www.rumahotp.io/api/v1/h2h/transaksi/create?target=${encodeURIComponent(target)}&id=${encodeURIComponent(productCode)}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();

    if (!data.success || !data.data?.id)
      return NextResponse.json({ success: false, message: data.message || 'Gagal membuat transaksi.' }, { status: 400 });

    const trx = data.data;

    // Deduct nokos balance
    user.nokosBalance -= price;
    await user.save();

    // Save to DB
    const dbOrder = await PpobOrder.create({
      userId: user._id,
      transaksiId: trx.id,
      productCode,
      productName,
      productNote: productNote || '',
      productType: productType || '',
      productBrand: productBrand || '',
      productCategory: productCategory || '',
      target,
      targetName: targetName || null,
      price,
      status: trx.status || 'processing',
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      order: {
        id: dbOrder._id.toString(),
        transaksiId: trx.id,
        status: trx.status,
        productName,
        productNote,
        target,
        price,
        message: trx.message,
      },
    });
  } catch (err) {
    console.error('PPOB order error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
