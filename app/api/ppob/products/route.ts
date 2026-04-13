export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.rumahotp.io/api/v1/h2h/product', {
      headers: {
        'x-apikey': process.env.RUMAHOTP_API_KEY || '',
        'Accept': 'application/json',
      },
      cache: 'no-store', // <-- KUNCI PERBAIKANNYA DI SINI
    });
    
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch PPOB products');
    
    return NextResponse.json({ success: true, products: data.data });
  } catch (err) {
    console.error('PPOB products error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil produk PPOB.' }, { status: 500 });
  }
}
