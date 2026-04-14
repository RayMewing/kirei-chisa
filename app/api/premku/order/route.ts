import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import CustomProduct from '@/lib/models/CustomProduct';
import PremkuOrder from '@/lib/models/PremkuOrder';
import Settings from '@/lib/models/Settings';
import { getAuthUser } from '@/lib/auth';
import { generateRefId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { productId, productName, isCustom } = await req.json();
    if (!productId) return NextResponse.json({ success: false, message: 'productId wajib.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    // ==========================================
    // JALUR 1: PRODUK CUSTOM (LOKAL DB)
    // ==========================================
    if (isCustom) {
      const product = await CustomProduct.findById(productId);
      if (!product || !product.isActive)
        return NextResponse.json({ success: false, message: 'Produk tidak tersedia.' }, { status: 404 });

      const availableIdx = product.accounts.findIndex((a: { sold: boolean }) => !a.sold);
      if (availableIdx === -1)
        return NextResponse.json({ success: false, message: 'Stok habis.' }, { status: 400 });

      if (user.premkuBalance < product.price)
        return NextResponse.json({
          success: false,
          message: `Saldo Premku tidak cukup. Butuh: Rp${product.price.toLocaleString('id-ID')}`,
        }, { status: 400 });

      // Tandai akun sebagai terjual
      product.accounts[availableIdx].sold = true;
      // FIX: Mongoose perlu tahu array subdoc berubah
      product.markModified('accounts');
      await product.save();

      // Potong saldo
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
    }

    // ==========================================
    // JALUR 2: PRODUK API PREMKU PUSAT
    // ==========================================
    const pricingSetting = await Settings.findOne({ key: 'premku_pricing' }).lean() as { value: Record<string, number> } | null;
    const customPrices: Record<string, number> = pricingSetting?.value || {};

    const prodRes = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY }),
      cache: 'no-store',
    });
    const prodData = await prodRes.json();
    const apiProduct = prodData.products?.find((p: { id: number }) => p.id === Number(productId));

    if (!apiProduct)
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan di server Premku.' }, { status: 404 });

    const finalPrice = customPrices[String(productId)]
      ? Number(customPrices[String(productId)])
      : Number(apiProduct.price);

    if (user.premkuBalance < finalPrice)
      return NextResponse.json({
        success: false,
        message: `Saldo Premku tidak cukup. Butuh: Rp${finalPrice.toLocaleString('id-ID')}`,
      }, { status: 400 });

    const refId = generateRefId();
    const orderRes = await fetch('https://premku.com/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.PREMKU_API_KEY,
        product_id: productId,
        qty: 1,
        ref_id: refId,
      }),
    });
    const orderData = await orderRes.json();

    if (!orderData.success)
      return NextResponse.json({ success: false, message: orderData.message || 'Gagal order ke Premku.' }, { status: 400 });

    user.premkuBalance -= finalPrice;
    await user.save();

    await PremkuOrder.create({
      userId: user._id,
      invoice: orderData.invoice,
      refId,
      productId: Number(productId),
      productName: productName || apiProduct.name,
      qty: 1,
      price: finalPrice,
      total: finalPrice,
      status: orderData.status || 'pending',
      accounts: [],
    });

    return NextResponse.json({
      success: true,
      order: {
        invoice: orderData.invoice,
        productName: productName || apiProduct.name,
        qty: 1,
        total: finalPrice,
        status: orderData.status || 'pending',
      },
    });
  } catch (err) {
    console.error('Premku order error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
