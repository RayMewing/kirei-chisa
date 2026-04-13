import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const accountCode = req.nextUrl.searchParams.get('account_code');
  const accountNumber = req.nextUrl.searchParams.get('account_number');

  if (!accountCode || !accountNumber)
    return NextResponse.json({ success: false, message: 'account_code dan account_number wajib.' }, { status: 400 });

  try {
    const res = await fetch(
      `https://www.rumahotp.io/api/v1/h2h/check/username?account_code=${encodeURIComponent(accountCode)}&account_number=${encodeURIComponent(accountNumber)}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return NextResponse.json({ success: data.success, data: data.data });
  } catch (err) {
    console.error('PPOB check game error:', err);
    return NextResponse.json({ success: false, message: 'Gagal cek akun game.' }, { status: 500 });
  }
}
