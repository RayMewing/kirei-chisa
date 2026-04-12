import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.rumahotp.io/api/v2/services', {
      headers: { 'x-apikey': process.env.RUMAHOTP_API_KEY!, 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json({ success: true, services: data.data });
  } catch (err) {
    console.error('Nokos services error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil daftar layanan.' }, { status: 500 });
  }
}
