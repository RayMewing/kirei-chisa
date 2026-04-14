'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { ShoppingBag, Search, Package, CheckCircle, XCircle, RefreshCw, X, Copy, Crosshair, TerminalSquare } from 'lucide-react';
import { extractCategory, formatRupiah } from '@/lib/utils';

// Tipe produk gabungan (API + Custom)
interface Product {
  id?: number;           // untuk produk API premku
  _id?: string;          // untuk produk custom DB
  name: string;
  description?: string;
  price: number;
  status?: 'available' | 'unavailable';
  stock: number;
  image?: string;        // URL gambar produk API
  imageBase64?: string;  // base64 gambar produk custom
  category?: string;
  source: 'api' | 'custom';
}

interface OrderResult {
  invoice: string; productName: string; qty: number; total: number; status: string;
  accounts?: { username: string; password: string; notes?: string }[];
}

export default function PremkuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [ordering, setOrdering] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch API products + custom products secara paralel
      const [apiRes, customRes] = await Promise.all([
        fetch('/api/premku/products'),
        fetch('/api/premku/custom-products'),
      ]);
      const [apiData, customData] = await Promise.all([apiRes.json(), customRes.json()]);

      const apiProducts: Product[] = apiData.success
        ? apiData.products.map((p: { id: number; name: string; description?: string; price: number; status: string; stock: number; image?: string }) => ({
            ...p,
            category: extractCategory(p.name),
            source: 'api' as const,
            stock: p.stock ?? 0,
          }))
        : [];

      const customProducts: Product[] = customData.success
        ? customData.products.map((p: { _id: string; name: string; description?: string; price: number; imageBase64?: string; category?: string; stock: number }) => ({
            ...p,
            status: p.stock > 0 ? 'available' : 'unavailable',
            source: 'custom' as const,
          }))
        : [];

      // Custom produk muncul duluan
      setProducts([...customProducts, ...apiProducts]);
    } catch (err) {
      console.error('Fetch products error:', err);
      toast.error('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category!)))];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Key unik per produk (beda antara API dan custom)
  const productKey = (p: Product) => p.source === 'custom' ? `custom-${p._id}` : `api-${p.id}`;

  const handleOrder = async (product: Product) => {
    const key = productKey(product);
    setOrdering(key);
    try {
      // Satu endpoint untuk keduanya, tapi kirim flag isCustom
      const res = await fetch('/api/premku/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.source === 'custom' ? product._id : product.id,
          productName: product.name,
          isCustom: product.source === 'custom',
          qty: 1,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) { toast.error('Login dulu ya!'); return; }
        toast.error(data.message);
        return;
      }
      toast.success('Pesanan berhasil dibuat!');
      setOrderResult(data.order);
      // Refresh stok setelah beli custom product
      if (product.source === 'custom') fetchProducts();
    } finally {
      setOrdering(null);
    }
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
        if (data.order.status === 'success') toast.success('Pesanan sukses!');
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      <div className="absolute top-0 right-0 w-full h-96 bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        <div className="mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <Crosshair className="text-red-500 animate-[spin_4s_linear_infinite]" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Premku_DB
            </h1>
          </div>
          <p className="text-red-500 font-mono text-xs pl-10">{'>>'} Premium node access index_</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10" />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
          <input
            className="input pl-11 bg-zinc-950/80 backdrop-blur-sm border-zinc-800/80 focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white"
            placeholder="Search module..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-6 border-l-2 border-red-600 pl-3 bg-zinc-950/50 p-2">
          <TerminalSquare size={16} className="text-zinc-500 mt-1" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)] font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-red-500/30 hover:text-red-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse h-64 border border-zinc-800 bg-zinc-900/50 rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 bg-zinc-900/30">
            <Package size={40} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-500 font-mono text-sm uppercase">{'>>'} DATA_NOT_FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => {
              const key = productKey(product);
              const isAvailable = product.source === 'custom'
                ? product.stock > 0
                : product.status === 'available';
              // Gambar produk: custom pakai base64, API pakai URL
              const imgSrc = product.source === 'custom' ? product.imageBase64 : product.image;

              return (
                <div key={key} className="card-product group flex flex-col h-full">
                  {/* Image */}
                  <div className="w-full h-28 bg-zinc-950 border border-zinc-800/80 mb-3 flex items-center justify-center overflow-hidden relative group-hover:border-red-500/30 transition-colors">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-10 pointer-events-none opacity-50" />
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-2 grayscale-[30%] group-hover:grayscale-0 transition-all z-0"
                      />
                    ) : (
                      <ShoppingBag size={32} className="text-zinc-700" />
                    )}
                  </div>

                  {/* Badge: custom vs api */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-red-500 bg-red-950/30 border border-red-900/50 px-2 py-0.5 uppercase tracking-widest">
                      {product.category}
                    </span>
                    {product.source === 'custom' && (
                      <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 uppercase tracking-widest">
                        Lokal
                      </span>
                    )}
                  </div>

                  <h3 className="font-black font-mono text-white text-base mb-1 uppercase tracking-wide leading-snug group-hover:text-red-400 transition-colors">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-xs font-mono text-zinc-500 mb-4 leading-relaxed line-clamp-2 border-l border-zinc-700 pl-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-zinc-800/50 mb-4">
                    <div>
                      <span className="block text-[10px] text-zinc-500 font-mono uppercase mb-0.5">Cost</span>
                      <span className="font-bold text-red-500 text-lg tracking-wider drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                        {formatRupiah(product.price)}
                      </span>
                    </div>
                    {isAvailable ? (
                      <span className="badge-active text-xs">
                        Stok: {product.stock > 999 ? '999+' : product.stock}
                      </span>
                    ) : (
                      <span className="badge-failed text-xs">Habis</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOrder(product)}
                    disabled={!isAvailable || ordering === key}
                    className={`w-full py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-mono font-bold ${
                      !isAvailable
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-red-600 border border-red-500 text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    }`}>
                    {ordering === key ? <span className="spinner border-white/30 border-t-white" /> : 'Execute'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Result Modal */}
        {orderResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOrderResult(null)}>
            <div className="bg-zinc-900 border border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.2)] p-6 w-full max-w-md relative overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 border-b border-red-900/50 pb-3">
                  <h3 className="font-black font-mono text-white text-lg uppercase tracking-widest">System_Log</h3>
                  <button onClick={() => setOrderResult(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 mb-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-500 uppercase">Module</span>
                    <span className="font-bold text-white text-right max-w-[60%]">{orderResult.productName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-500 uppercase">ID</span>
                    <span className="text-red-400">{orderResult.invoice}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-500 uppercase">Cost</span>
                    <span className="font-bold text-red-500">{formatRupiah(orderResult.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 uppercase">State</span>
                    {statusBadge(orderResult.status)}
                  </div>
                </div>

                {orderResult.status === 'success' && orderResult.accounts && orderResult.accounts.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-mono font-bold text-emerald-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Decrypted_Data:
                    </p>
                    {orderResult.accounts.map((acc, i) => (
                      <div key={i} className="bg-emerald-950/20 border border-emerald-900/50 p-3 text-xs font-mono space-y-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600/70">ID: <span className="font-bold text-emerald-400 ml-1">{acc.username}</span></span>
                          <button onClick={() => { navigator.clipboard.writeText(acc.username); toast.success('Copied!'); }}>
                            <Copy size={13} className="text-emerald-600 hover:text-emerald-400" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600/70">KEY: <span className="font-bold text-emerald-400 ml-1">{acc.password}</span></span>
                          <button onClick={() => { navigator.clipboard.writeText(acc.password); toast.success('Copied!'); }}>
                            <Copy size={13} className="text-emerald-600 hover:text-emerald-400" />
                          </button>
                        </div>
                        {acc.notes && (
                          <p className="text-emerald-700/60 border-t border-emerald-900/30 pt-1.5">
                            Note: {acc.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCheckStatus}
                  disabled={checkingStatus || orderResult.status === 'success'}
                  className="btn-secondary w-full py-3 text-xs">
                  {checkingStatus
                    ? <span className="spinner border-red-500/30 border-t-red-500" />
                    : <><RefreshCw size={14} /> Ping_Server</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
