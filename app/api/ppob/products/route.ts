export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
// Import cloudscraper
import cloudscraper from 'cloudscraper';

export async function GET() {
  try {
    // Setup opsi untuk cloudscraper
    const options = {
      method: 'GET',
      url: 'https://www.rumahotp.io/api/v1/h2h/product',
      headers: {
        'x-apikey': process.env.RUMAHOTP_API_KEY || '',
        'Accept': 'application/json',
      }
    };

    // Eksekusi cloudscraper (dia me-return string JSON, bukan object langsung)
    const responseString = await cloudscraper(options);
    
    // Ubah string JSON jadi object JavaScript
    const data = JSON.parse(responseString as string);

    if (!data.success) {
      console.error('🚨 Error dari RumahOTP:', data);
      throw new Error('Failed to fetch PPOB products');
    }

    return NextResponse.json({ success: true, products: data.data });
  } catch (err: any) {
    // Kalau Cloudflare tetep ngeblok, errornya bakal ketangkep di sini
    console.error('PPOB products error:', err.message || err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil produk PPOB.' }, { status: 500 });
  }
}
