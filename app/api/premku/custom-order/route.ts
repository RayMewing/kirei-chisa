import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import CustomProduct from '@/lib/models/CustomProduct';
import PremkuOrder from '@/lib/models/PremkuOrder';
import { getAuthUser } from '@/lib/auth';
import { generateRefId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ success: false, message: 'productId wajib.' }, { status: 400 });

    await connectDB();

    const [user, product] = await Promise.all([
      User.findById(authUser.userId),
      CustomProduct.findById(productId),
    ]);

    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });
    if (!product || !product.isActive)
      return NextResponse.json({ success: false, message: 'Produk tidak tersedia.' }, { status: 404 });

    const availableIdx = product.accounts.findIndex((a: any) => !a.sold);
    if (availableIdx === -1)
      return NextResponse.json({ success: false, message: 'Stok habis.' }, { status: 400 });

    if (user.premkuBalance < product.price)
      return NextResponse.json({
        success: false,
        message: `Saldo Premku tidak cukup. Butuh: Rp${product.price.toLocaleString('id-ID')}`,
      }, { status: 400 });

    // Mark account as sold
    product.accounts[availableIdx].sold = true;
    await product.save();

    // Deduct balance
    user.premkuBalance -= product.price;
    await user.save();

    const acc = product.accounts[availableIdx];
    const refId = generateRefId();
    const invoice = `KC-CUSTOM-${Date.now()}`;

    await PremkuOrder.create({
      userId: user._id,
      invoice,
      refId,
      productId: 0,
      productName: product.name,
      qty: 1,
      price: product.price,
      total: product.price,
      status: 'success',
      accounts: [{ username: acc.email, password: acc.password }],
    });

    return NextResponse.json({
      success: true,
      message: 'Pembelian berhasil!',
      order: {
        invoice,
        productName: product.name,
        qty: 1,
        total: product.price,
        status: 'success',
        accounts: [{ username: acc.email, password: acc.password, notes: acc.notes }],
      },
    });
  } catch (err) {
    console.error('Custom product order error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
