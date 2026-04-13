import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import NokosDeposit from '@/lib/models/NokosDeposit';
import Settings from '@/lib/models/Settings'; // >> WAJIB IMPORT INI
import { getAuthUser } from '@/lib/auth';

// Matikan cache biar data selalu real-time
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 10000) return NextResponse.json({ success: false, message: 'Minimum deposit Rp10.000.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    // 1. Ambil data Fee QRIS dari Database Settings
        // 1. Ambil data Fee QRIS dari Database Settings
    const feeSetting = await Settings.findOne({ key: 'qris_fee_percent' }).lean() as any;
    const qrisFeePercent = feeSetting?.value ? parseFloat(feeSetting.value) || 0 : 0;

    // 2. Hitung Fee dan Total Permintaan
    // Contoh: 10000 * (2 / 100) = 200
    const feeAmount = Math.round(amount * (qrisFeePercent / 100));
    const finalAmountToNokos = amount + feeAmount; // 10000 + 200 = 10200

    // 3. Tembak ke API RumahOTP pakai harga yang udah ditambah fee (10200)
    const res = await fetch(
      `https://www.rumahotp.io/api/v2/deposit/create?amount=${finalAmountToNokos}&payment_id=qris`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    if (!data.success) return NextResponse.json({ success: false, message: data.message || 'Gagal membuat deposit.' }, { status: 400 });

    const dep = data.data;
    
    // 4. Simpan ke database kita
    const dbDep = await NokosDeposit.create({
      userId: user._id,
      depositId: dep.id,
      amount: dep.total, // Ini total tagihan QRIS dari API RumahOTP
      fee: feeAmount,    // Catat fee admin kita
      
      // KUNCI PENTING: Paksa "diterima" jadi "amount" awal (10k), 
      // biar user nggak dapet saldo lebih dari yang dia minta.
      diterima: amount,  
      
      paymentId: dep.method || 'qris',
      qrString: dep.qr_string || '',
      qrImage: dep.qr_image || '',
      status: 'pending',
      expiredAt: new Date(dep.expired_at_ts),
    });

    // 5. Kembalikan format data ke Frontend biar UI-nya nampilin fee & total bayar
    return NextResponse.json({
      success: true,
      deposit: {
        id: dbDep._id.toString(),
        depositId: dep.id,
        amount: amount,          // Nominal awal (10k)
        totalBayar: dep.total,   // Total scan QRIS (10.200)
        fee: feeAmount,          // Info pajak
        diterima: amount,        // Saldo yang bakal didapat
        qrImage: dep.qr_image,
        qrString: dep.qr_string,
        expiredAt: dep.expired_at,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('Nokos deposit error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
