import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomProduct from '@/lib/models/CustomProduct';
import { requireAdmin } from '@/lib/adminAuth';
import { extractCategory } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await connectDB();
  const products = await CustomProduct.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { action, ...body } = await req.json();
  await connectDB();

  // Create new product
  if (action === 'create') {
    const { name, description, imageBase64, price, category } = body;
    if (!name || !price) return NextResponse.json({ success: false, message: 'Nama dan harga wajib.' }, { status: 400 });
    const product = await CustomProduct.create({
      name, description, imageBase64: imageBase64 || '',
      price, category: category || extractCategory(name),
    });
    return NextResponse.json({ success: true, product });
  }

  // Add account stock to existing product
  if (action === 'add_account') {
    const { productId, email, password, notes } = body;
    if (!productId || !email || !password)
      return NextResponse.json({ success: false, message: 'productId, email, password wajib.' }, { status: 400 });
    const product = await CustomProduct.findByIdAndUpdate(
      productId,
      { $push: { accounts: { email, password, notes: notes || '', sold: false } } },
      { new: true }
    );
    return NextResponse.json({ success: true, product });
  }

  return NextResponse.json({ success: false, message: 'Action tidak valid.' }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ success: false, message: 'id wajib.' }, { status: 400 });

  await connectDB();
  const product = await CustomProduct.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, product });
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id, productId, accountIndex } = await req.json();
  await connectDB();

  // Delete a specific account from stock
  if (productId && accountIndex !== undefined) {
    const product = await CustomProduct.findById(productId);
    if (!product) return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
    product.accounts.splice(accountIndex, 1);
    await product.save();
    return NextResponse.json({ success: true, message: 'Akun dihapus dari stok.' });
  }

  // Delete entire product
  await CustomProduct.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: 'Produk dihapus.' });
}
