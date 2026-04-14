import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomProduct from '@/lib/models/CustomProduct';
import Settings from '@/lib/models/Settings';
import { extractCategory } from '@/lib/utils'; // WAJIB IMPORT INI BUAT KATEGORI API

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    
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
        image: p.imageBase64 || '', 
        category: p.category || extractCategory(p.name), 
        isCustom: true
      };
    });


    const pricingSetting = await Settings.findOne({ key: 'premku_pricing' }).lean() as any;
    const customPrices = pricingSetting?.value || {};

    
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
        description: p.description || '',
        
        price: customPrices[String(p.id)] ? Number(customPrices[String(p.id)]) : Number(p.price), 
        status: p.status,
        
        stock: p.stock !== undefined ? Number(p.stock) : (p.status === 'available' ? 999 : 0),
        image: p.image || '', 
        category: extractCategory(p.name), 
        isCustom: false
      }));
    }


    
    const allProducts = [...mappedCustom, ...premkuProds];

    return NextResponse.json({ success: true, products: allProducts });
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data produk.' }, { status: 500 });
  }
}
