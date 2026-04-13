import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import CustomProduct from '@/lib/models/CustomProduct';
import PremkuOrder from '@/lib/models/PremkuOrder';
import Settings from '@/lib/models/Settings'; // >> Wajib buat ngecek harga admin
import { getAuthUser } from '@/lib/auth';
import { generateRefId } from '@/lib/utils';

// WAJIB: Matiin cache biar sistem order ga nyangkut!
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    // Kita tangkep isCustom dari frontend
    const { productId, productName, isCustom } = await req.json();
    if (!productId) return NextResponse.json({ success: false, message: 'productId wajib.' }, { status: 400 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User tidak ditemukan.' }, { status: 404 });

    // ==========================================
    // JALUR 1: EKSEKUSI PRODUK CUSTOM (LOKAL DB)
    // ==========================================
    if (isCustom) {
      const product = await CustomProduct.findById(productId);
      if (!product || !product.isActive)
        return NextResponse.json({ success: false, message: 'Produk tidak tersedia atau Offline.' }, { status: 404 });

      // Cari index stok yang belum terjual
      const availableIdx = product.accounts.findIndex((a: any) => !a.sold);
      if (availableIdx === -1)
        return NextResponse.json({ success: false, message: 'Stok habis bro!' }, { status: 400 });

      // Cek Saldo
      if (user.premkuBalance < product.price)
        return NextResponse.json({
          success: false,
          message: `Saldo kurang! Butuh: Rp${product.price.toLocaleString('id-ID')}`,
        }, { status: 400 });

      // 1. Eksekusi Potong Stok
      product.accounts[availableIdx].sold = true;
      await product.save();

      // 2. Eksekusi Potong Saldo
      user.premkuBalance -= product.price;
      await user.save();

      const acc = product.accounts[availableIdx];
      const refId = generateRefId ? generateRefId() : `REF-${Date.now()}`;
      const invoice = `KC-CUSTOM-${Date.now()}`;

      // 3. Catat di Database Order
      await PremkuOrder.create({
        userId: user._id,
        invoice,
        refId,
        productId: 0, // 0 penanda kalau ini barang custom
        productName: product.name,
        qty: 1,
        price: product.price,
        total: product.price,
        status: 'success', // Langsung sukses karena barang udah ada di DB kita
        accounts: [{ username: acc.email, password: acc.password }],
      });

      return NextResponse.json({
        success: true,
        message: 'Decryption Complete!',
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
    // JALUR 2: EKSEKUSI PRODUK API PREMKU PUSAT
    // ==========================================
    else {
      // 1. Cari harga custom admin dulu (kalau admin nge-set harga)
      const pricingSetting = await Settings.findOne({ key: 'premku_pricing' }).lean() as any;
      const customPrices = pricingSetting?.value || {};
      
      // 2. Tembak API produk buat cari tahu harga aslinya kalau admin gak set harga custom
      const prodRes = await fetch('https://premku.com/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: process.env.PREMKU_API_KEY }),
        next: { revalidate: 0 }
      });
      const prodData = await prodRes.json();
      const apiProduct = prodData.products?.find((p: any) => p.id === Number(productId));
      
      if (!apiProduct) return NextResponse.json({ success: false, message: 'Produk API tidak ditemukan di server pusat.' }, { status: 404 });

      // Harga final = Harga Admin (kalau ada) ATAU Harga Asli API
      const finalPrice = customPrices[String(productId)] ? Number(customPrices[String(productId)]) : Number(apiProduct.price);

      // Cek Saldo User vs Harga Final
      if (user.premkuBalance < finalPrice) {
        return NextResponse.json({ success: false, message: `Saldo kurang! Butuh Rp${finalPrice.toLocaleString('id-ID')}` }, { status: 400 });
      }

      // 3. Eksekusi Order ke API Premku Pusat
      const refId = generateRefId ? generateRefId() : `REF-${Date.now()}`;
      const orderRes = await fetch('https://premku.com/api/order', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            api_key: process.env.PREMKU_API_KEY,
            product_id: productId,
            qty: 1,
            ref_id: refId
         })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
         return NextResponse.json({ success: false, message: `API Pusat Error: ${orderData.message}` }, { status: 400 });
      }

      // 4. Potong Saldo User (Sesuai Harga Mark-Up Admin)
      user.premkuBalance -= finalPrice;
      await user.save();

      const ord = orderData.data;

      // 5. Catat Log Transaksi
      await PremkuOrder.create({
        userId: user._id,
        invoice: ord.invoice,
        refId: ord.ref_id,
        productId: ord.product_id,
        productName: productName || apiProduct.name,
        qty: 1,
        price: finalPrice, // Simpan harga jual kita ke riwayat
        total: finalPrice,
        status: ord.status, // Status dari Premku
        accounts: [],
      });

      return NextResponse.json({
        success: true,
        order: {
           invoice: ord.invoice,
           productName: productName || apiProduct.name,
           qty: 1,
           total: finalPrice,
           status: ord.status
        }
      });
    }

  } catch (err) {
    console.error('System Order Execution error:', err);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
