'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ShoppingBag, Search, Package, CheckCircle, XCircle, RefreshCw, X, Copy, Crosshair, TerminalSquare } from 'lucide-react';
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
        if (res.status === 401) { toast.error('System Auth Failed: Login Required'); return; }
        toast.error(data.message); return;
      }
      toast.success('Initialize Success! Order Created.');
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
        if (data.order.status === 'success') toast.success('Decryption Complete: Data Retrieved!');
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
      {/* Cyber Background Glow */}
      <div className="absolute top-0 right-0 w-full h-96 bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Header Title */}
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
          <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10"></div>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
          <input className="input pl-11 bg-zinc-950/80 backdrop-blur-sm border-zinc-800/80 focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white" 
            placeholder="Search module..." 
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories (Terminal Tabs) */}
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
              <div key={i} className="card-product animate-pulse h-64 border-zinc-800">
                <div className="w-full h-28 bg-zinc-950/80 mb-3" />
                <div className="h-4 bg-zinc-800 w-3/4 mb-2" />
                <div className="h-3 bg-zinc-800 w-full mb-3" />
                <div className="h-8 bg-zinc-800 mt-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 bg-zinc-900/30">
            <Package size={40} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-500 font-mono text-sm uppercase">{'>>'} DATA_NOT_FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="card-product group flex flex-col h-full">
                {/* Image */}
                <div className="w-full h-28 bg-zinc-950 border border-zinc-800/80 mb-3 flex items-center justify-center overflow-hidden relative group-hover:border-red-500/30 transition-colors">
                  {/* Scanline overlay for image */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-10 pointer-events-none opacity-50" />
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-contain p-2 grayscale-[30%] group-hover:grayscale-0 transition-all z-0" sizes="200px" />
                  ) : (
                    <ShoppingBag size={32} className="text-zinc-700" />
                  )}
                </div>

                {/* Category tag */}
                <span className="text-[10px] font-mono font-bold text-red-500 bg-red-950/30 border border-red-900/50 px-2 py-0.5 w-fit mb-2 uppercase tracking-widest">
                  {product.category}
                </span>

                <h3 className="font-black font-mono text-white text-base mb-1 uppercase tracking-wide leading-snug group-hover:text-red-400 transition-colors">{product.name}</h3>
                
                {product.description && (
                  <p className="text-xs font-mono text-zinc-500 mb-4 leading-relaxed line-clamp-2 border-l border-zinc-700 pl-2">{product.description}</p>
                )}

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-zinc-800/50 mb-4">
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-mono uppercase mb-0.5">Cost</span>
                    <span className="font-bold text-red-500 text-lg tracking-wider drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(product.price)}</span>
                  </div>
                  {product.status === 'available' ? (
                    <span className="badge-active">Node: {product.stock}</span>
                  ) : (
                    <span className="badge-failed">Offline</span>
                  )}
                </div>

                <button
                  onClick={() => handleOrder(product)}
                  disabled={product.status !== 'available' || ordering === product.id}
                  className={`w-full py-3 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 font-mono font-bold ${
                    product.status !== 'available'
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-red-600 border border-red-500 text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                  }`}>
                  {ordering === product.id ? <span className="spinner border-white/30 border-t-white" /> : 'Execute'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order Result Modal - Cyber Style */}
        {orderResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOrderResult(null)}>
            <div className="bg-zinc-900 border border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.2)] p-6 w-full max-w-md relative overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
              
              {/* Tech Corners */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
              {/* Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 border-b border-red-900/50 pb-3">
                  <h3 className="font-black font-mono text-white text-lg uppercase tracking-widest">System_Log</h3>
                  <button onClick={() => setOrderResult(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 mb-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2"><span className="text-zinc-500 uppercase">Module</span><span className="font-bold text-white uppercase text-right max-w-[60%]">{orderResult.productName}</span></div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2"><span className="text-zinc-500 uppercase">ID</span><span className="text-red-400">{orderResult.invoice}</span></div>
                  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2"><span className="text-zinc-500 uppercase">Cost</span><span className="font-bold text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(orderResult.total)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-500 uppercase">State</span>{statusBadge(orderResult.status)}</div>
                </div>

                {orderResult.status === 'success' && orderResult.accounts && orderResult.accounts.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-mono font-bold text-emerald-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Decrypted_Data:
                    </p>
                    {orderResult.accounts.map((acc, i) => (
                      <div key={i} className="bg-emerald-950/20 border border-emerald-900/50 p-3 text-xs font-mono space-y-2 relative group">
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-emerald-600/70 uppercase">ID: <span className="font-bold text-emerald-400 normal-case ml-2">{acc.username}</span></span>
                          <button onClick={() => { navigator.clipboard.writeText(acc.username); toast.success('Copied to clipboard!'); }}>
                            <Copy size={14} className="text-emerald-600 hover:text-emerald-400" />
                          </button>
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-emerald-600/70 uppercase">KEY: <span className="font-bold text-emerald-400 normal-case ml-2">{acc.password}</span></span>
                          <button onClick={() => { navigator.clipboard.writeText(acc.password); toast.success('Copied to clipboard!'); }}>
                            <Copy size={14} className="text-emerald-600 hover:text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleCheckStatus} disabled={checkingStatus || orderResult.status === 'success'}
                  className="btn-secondary w-full py-3 text-xs relative group overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  {checkingStatus ? <span className="spinner border-red-500/30 border-t-red-500" /> : <><RefreshCw size={14} /> Ping_Server</>}
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
