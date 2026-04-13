import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.RUMAHOTP_API_KEY;

  if (!apiKey) {
    console.error('PPOB products error: RUMAHOTP_API_KEY is not set');
    return NextResponse.json({ success: false, message: 'API key tidak dikonfigurasi.' }, { status: 500 });
  }

  try {
    const res = await fetch('https://www.rumahotp.io/api/v1/h2h/product', {
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('PPOB products HTTP error:', res.status, res.statusText);
      return NextResponse.json({ success: false, message: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    if (!data.success) {
      console.error('PPOB products API returned failure:', JSON.stringify(data));
      return NextResponse.json({ success: false, message: data.message || 'API mengembalikan error.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, products: data.data });
  } catch (err) {
    console.error('PPOB products fetch error:', err);
    return NextResponse.json({ success: false, message: 'Gagal terhubung ke server PPOB.' }, { status: 500 });
  }
}
