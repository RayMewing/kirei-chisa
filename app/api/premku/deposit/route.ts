import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuDeposit from '@/lib/models/PremkuDeposit';
import Settings from '@/lib/models/Settings'; // >> WAJIB IMPORT INI
import { getAuthUser } from '@/lib/auth';

// Matikan cache biar data selalu real-time
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 1000)
      return NextResponse.json({ success: false, message: 'Minimum deposit Rp1000.' }, { status: 400 });
    if (amount > 5000000)
      return NextResponse.json({ success: false, message: 'Maksimum deposit Rp5.000.000.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    // 1. Ambil data Fee QRIS dari Database Settings
    const feeSetting = await Settings.findOne({ key: 'qris_fee_percent' }).lean();
    const qrisFeePercent = feeSetting ? parseFloat(feeSetting.value as string) || 0 : 0;
    
    // 2. Hitung Fee dan Total Bayar
    // Contoh: 10000 * (10 / 100) = 1000
    const feeAmount = Math.round(amount * (qrisFeePercent / 100));
    const finalAmountToPremku = amount + feeAmount; // 10000 + 1000 = 11000

    // 3. Tembak ke API Premku pakai harga yang udah ditambah fee
    const res = await fetch('https://premku.com/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, amount: finalAmountToPremku }),
    });
    
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: data.message || 'Gagal membuat deposit.' }, { status: 400 });

    const dep = data.data;
    
    // 4. Simpan ke database kita
    const dbDeposit = await PremkuDeposit.create({
      userId: user._id,
      invoice: dep.invoice,
      // Penting: amount tetep yang asli (10k) biar saldo user nanti nambahnya 10k, bukan 11k
      amount: amount, 
      totalBayar: dep.total_bayar, // Total dari Premku (11k + kode unik)
      kodeUnik: dep.kode_unik,
      qrImage: dep.qr_image,
      qrRaw: dep.qr_raw,
      status: 'pending',
    });

    // 5. Kembalikan data ke Frontend (termasuk info fee biar UI-nya bagus)
    return NextResponse.json({
      success: true,
      deposit: {
        id: dbDeposit._id.toString(),
        invoice: dep.invoice,
        amount: amount,            // Base amount
        fee: feeAmount,            // Fee tambahan
        diterima: amount,          // Saldo yang bakal masuk ke user
        totalBayar: dep.total_bayar, // Total yang harus ditransfer
        kodeUnik: dep.kode_unik,
        qrImage: dep.qr_image,
        qrRaw: dep.qr_raw,
        expiredIn: dep.expired_in,
      },
    });
  } catch (err) {
    console.error('Premku deposit error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
