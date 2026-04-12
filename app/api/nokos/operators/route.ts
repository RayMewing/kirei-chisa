import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country');
  const providerId = req.nextUrl.searchParams.get('provider_id');
  if (!country || !providerId) return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });

  try {
    const res = await fetch(
      `https://www.rumahotp.io/api/v2/operators?country=${encodeURIComponent(country)}&provider_id=${providerId}`,
      { headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return NextResponse.json({ success: true, operators: data.data });
  } catch (err) {
    console.error('Nokos operators error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil operator.' }, { status: 500 });
  }
}
