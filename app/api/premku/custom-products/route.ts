import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomProduct from '@/lib/models/CustomProduct';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();

  // Ambil semua field yang dibutuhkan - jangan exclude subdoc field karena bisa
  // merusak filter `.sold`. Email/password tidak ikut dikirim ke client
  // karena kita hanya map ke `stock` (count), bukan mengirim array accounts-nya.
  const products = await CustomProduct.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const mapped = products.map(p => ({
    _id: String(p._id),
    name: p.name,
    description: p.description,
    imageBase64: p.imageBase64,
    price: p.price,
    category: p.category,
    // Hitung stok yang belum terjual - butuh field `sold` utuh
    stock: Array.isArray(p.accounts)
      ? p.accounts.filter((a: { sold: boolean }) => !a.sold).length
      : 0,
    source: 'custom' as const,
  }));

  return NextResponse.json({ success: true, products: mapped });
}
