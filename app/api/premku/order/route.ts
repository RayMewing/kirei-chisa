import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import PremkuOrder from '@/lib/models/PremkuOrder';
import { getAuthUser } from '@/lib/auth';
import { generateRefId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { productId, productName, qty = 1 } = await req.json();
    if (!productId || !productName)
      return NextResponse.json({ success: false, message: 'Data produk tidak lengkap.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    // Check stock first
    const stockRes = await fetch('https://premku.com/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, product_id: productId }),
    });
    const stockData = await stockRes.json();
    if (!stockData.success || stockData.stock < qty)
      return NextResponse.json({ success: false, message: 'Stok produk tidak tersedia.' }, { status: 400 });

    // Get price from products endpoint
    const prodRes = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY }),
    });
    const prodData = await prodRes.json();
    const product = prodData.products?.find((p: { id: number }) => p.id === productId);
    if (!product) return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });

    const total = product.price * qty;

    if (user.premkuBalance < total)
      return NextResponse.json({ success: false, message: `Saldo Premku tidak cukup. Saldo: Rp${user.premkuBalance.toLocaleString('id-ID')}, Butuh: Rp${total.toLocaleString('id-ID')}` }, { status: 400 });

    const refId = generateRefId();

    // Create order at premku
    const orderRes = await fetch('https://premku.com/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY, product_id: productId, qty, ref_id: refId }),
    });
    const orderData = await orderRes.json();

    if (!orderData.success)
      return NextResponse.json({ success: false, message: orderData.message || 'Gagal membuat pesanan.' }, { status: 400 });

    // Deduct balance
    user.premkuBalance -= total;
    await user.save();

    // Save order to DB
    const dbOrder = await PremkuOrder.create({
      userId: user._id,
      invoice: orderData.invoice,
      refId,
      productId,
      productName: orderData.product || productName,
      qty,
      price: product.price,
      total,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat.',
      order: {
        id: dbOrder._id.toString(),
        invoice: orderData.invoice,
        productName: dbOrder.productName,
        qty,
        total,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('Premku order error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
