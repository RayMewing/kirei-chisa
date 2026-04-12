'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ShoppingBag, Search, Package, CheckCircle, XCircle, RefreshCw, X, Copy } from 'lucide-react';
import { extractCategory, formatRupiah } from '@/lib/utils';

interface Product {
  id: number; name: string; description?: string; price: number;
  status: 'available' | 'unavailable'; stock: number; image?: string;
  category?: string;
}
interface OrderResult {
  invoice: string; productName: string; qty: number; total: number; status: string;
  accounts?: { username: string; password: string }[];
}

export default function PremkuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [ordering, setOrdering] = useState<number | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/premku/products');
      const data = await res.json();
      if (data.success) {
        const withCat = data.products.map((p: Product) => ({ ...p, category: extractCategory(p.name) }));
        setProducts(withCat);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category!)))];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOrder = async (product: Product) => {
    setOrdering(product.id);
    try {
      const res = await fetch('/api/premku/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, productName: product.name, qty: 1 }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) { toast.error('Login dulu ya!'); return; }
        toast.error(data.message); return;
      }
      toast.success('Pesanan berhasil dibuat!');
      setOrderResult(data.order);
    } finally { setOrdering(null); }
  };

  const handleCheckStatus = async () => {
    if (!orderResult) return;
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/premku/order-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: orderResult.invoice }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderResult(prev => prev ? { ...prev, status: data.order.status, accounts: data.order.accounts } : prev);
        if (data.order.status === 'success') toast.success('Pesanan berhasil!');
        else toast(`Status: ${data.order.status}`);
      }
    } finally { setCheckingStatus(false); }
  };

  const statusBadge = (status: string) => {
    if (status === 'success') return <span className="badge-success"><CheckCircle size={11} />Sukses</span>;
    if (status === 'failed') return <span className="badge-failed"><XCircle size={11} />Gagal</span>;
    return <span className="badge-pending">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={22} className="text-brand" />
            <h1 className="section-title">Premku — Akun Premium</h1>
          </div>
          <p className="section-sub">Beli akun premium digital dengan harga terbaik & stok realtime</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 bg-white" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40 hover:text-brand'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-28 bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-3" />
                <div className="h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="card flex flex-col hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-contain p-2" sizes="200px" />
                  ) : (
                    <ShoppingBag size={32} className="text-gray-300" />
                  )}
                </div>

                {/* Category tag */}
                <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full w-fit mb-1.5">
                  {product.category}
                </span>

                <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-3 mt-auto">
                  <span className="font-bold text-brand text-base">{formatRupiah(product.price)}</span>
                  {product.status === 'available' ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Stok: {product.stock}</span>
                  ) : (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Habis</span>
                  )}
                </div>

                <button
                  onClick={() => handleOrder(product)}
                  disabled={product.status !== 'available' || ordering === product.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    product.status !== 'available'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}>
                  {ordering === product.id ? <span className="spinner" /> : 'Beli Sekarang'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order Result Modal */}
        {orderResult && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setOrderResult(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
                <button onClick={() => setOrderResult(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Produk</span><span className="font-medium">{orderResult.productName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Invoice</span><span className="font-mono text-xs">{orderResult.invoice}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-brand">{formatRupiah(orderResult.total)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Status</span>{statusBadge(orderResult.status)}</div>
              </div>

              {orderResult.status === 'success' && orderResult.accounts && orderResult.accounts.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Akun Kamu:</p>
                  {orderResult.accounts.map((acc, i) => (
                    <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email: <span className="font-mono font-medium">{acc.username}</span></span>
                        <button onClick={() => { navigator.clipboard.writeText(acc.username); toast.success('Disalin!'); }}>
                          <Copy size={13} className="text-gray-400 hover:text-brand" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Pass: <span className="font-mono font-medium">{acc.password}</span></span>
                        <button onClick={() => { navigator.clipboard.writeText(acc.password); toast.success('Disalin!'); }}>
                          <Copy size={13} className="text-gray-400 hover:text-brand" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleCheckStatus} disabled={checkingStatus || orderResult.status === 'success'}
                className="btn-secondary w-full py-2.5 text-sm">
                {checkingStatus ? <span className="spinner spinner-brand" /> : <><RefreshCw size={14} />Cek Status Pesanan</>}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
