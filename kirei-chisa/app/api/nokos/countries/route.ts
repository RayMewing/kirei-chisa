import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get('service_id');
  if (!serviceId) return NextResponse.json({ success: false, message: 'service_id wajib.' }, { status: 400 });

  try {
    const res = await fetch(`https://www.rumahotp.io/api/v2/countries?service_id=${serviceId}`, {
      headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' },
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json({ success: true, countries: data.data });
  } catch (err) {
    console.error('Nokos countries error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil daftar negara.' }, { status: 500 });
  }
}
