import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const bankCode = req.nextUrl.searchParams.get('bank_code');
  const accountNumber = req.nextUrl.searchParams.get('account_number');

  if (!bankCode || !accountNumber)
    return NextResponse.json({ success: false, message: 'bank_code dan account_number wajib.' }, { status: 400 });

  try {
    const res = await fetch(
      `https://www.rumahotp.io/api/v1/h2h/check/rekening?bank_code=${encodeURIComponent(bankCode)}&account_number=${encodeURIComponent(accountNumber)}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return NextResponse.json({ success: data.success, data: data.data });
  } catch (err) {
    console.error('PPOB check rekening error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek rekening.' }, { status: 500 });
  }
}
