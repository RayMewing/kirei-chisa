//test
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomProduct from '@/lib/models/CustomProduct';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const products = await CustomProduct.find({ isActive: true })
    .select('-accounts.email -accounts.password -accounts.notes')
    .sort({ createdAt: -1 })
    .lean();

  // Map to show available stock count
  const mapped = products.map(p => ({
    _id: p._id,
    name: p.name,
    description: p.description,
    imageBase64: p.imageBase64,
    price: p.price,
    category: p.category,
    stock: p.accounts.filter((a: any) => !a.sold).length,
    source: 'custom',
  }));

  return NextResponse.json({ success: true, products: mapped });
}
