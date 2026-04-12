import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY }),
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch products');
    return NextResponse.json({ success: true, products: data.products });
  } catch (err) {
    console.error('Premku products error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk.' }, { status: 500 });
  }
}
