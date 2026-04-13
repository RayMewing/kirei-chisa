import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomProduct from '@/lib/models/CustomProduct';
import Settings from '@/lib/models/Settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // 1. Ambil Custom Products dari Database lokal
    const customProds = await CustomProduct.find({ isActive: true }).lean() as any[];
    const mappedCustom = customProds.map(p => {
      const stock = p.accounts ? p.accounts.filter((a: any) => !a.sold).length : 0;
      return {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        status: stock > 0 ? 'available' : 'unavailable',
        stock: stock,
        image: p.imageBase64,
        category: p.category || 'Lainnya',
        isCustom: true // Penanda penting buat frontend
      };
    });

    // 2. Ambil harga settingan admin untuk Premku API
    const pricingSetting = await Settings.findOne({ key: 'premku_pricing' }).lean() as any;
    const customPrices = pricingSetting?.value || {};

    // 3. Ambil produk dari API Premku Pusat
    const res = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY }),
      next: { revalidate: 0 }
    });
    const data = await res.json();
    
    let premkuProds = [];
    if (data.success) {
      premkuProds = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: '',
        // Pakai harga admin kalau diset, kalau gak pakai harga asli
        price: customPrices[String(p.id)] ? Number(customPrices[String(p.id)]) : Number(p.price), 
        status: p.status,
        stock: p.status === 'available' ? 999 : 0,
        image: '',
        category: 'Premku API',
        isCustom: false
      }));
    }

    // 4. Gabungin keduanya
    const allProducts = [...mappedCustom, ...premkuProds];

    return NextResponse.json({ success: true, products: allProducts });
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk.' }, { status: 500 });
  }
}
