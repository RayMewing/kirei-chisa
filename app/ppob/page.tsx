'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  Zap, Search, RefreshCw, X, CheckCircle, XCircle,
  Gamepad2, Wallet, ChevronRight, Copy, AlertCircle,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface Product {
  code: string; name: string; note: string; type: string;
  brand: string; category: string; img_url: string; price: number;
  price_info: { price_original: number; price_discount: number; price_discount_percent: number };
}

interface OrderResult {
  transaksiId: string; productName: string; productNote: string;
  productBrand: string; productCategory: string; target: string;
  targetName: string | null; price: number;
  status: 'processing' | 'success' | 'failed' | 'canceled' | 'pending';
  refund: boolean; sn: string | null;
}

type CategoryTab = 'semua' | 'game' | 'ewallet' | 'pulsa' | 'lainnya';

// Map brand → display name for grouping
function getBrandLabel(brand: string): string {
  const map: Record<string, string> = {
    freefire: 'Free Fire', mobilelegends: 'Mobile Legends', ml: 'Mobile Legends',
    pubg: 'PUBG Mobile', valorant: 'Valorant', genshin: 'Genshin Impact',
    codm: 'COD Mobile', roblox: 'Roblox', steamwallet: 'Steam Wallet',
    dana: 'DANA', ovo: 'OVO', gopay: 'GoPay', shopeepay: 'ShopeePay',
    linkaja: 'LinkAja', sakuku: 'Sakuku',
    telkomsel: 'Telkomsel', xl: 'XL', indosat: 'Indosat', tri: 'Tri', smartfren: 'Smartfren',
  };
  return map[brand.toLowerCase()] ?? brand.toUpperCase();
}

function getCategoryTab(category: string): CategoryTab {
  const c = category.toLowerCase();
  if (c === 'game' || c === 'games') return 'game';
  if (c === 'ewallet' || c === 'e-wallet') return 'ewallet';
  if (c === 'pulsa' || c === 'data' || c === 'paket') return 'pulsa';
  return 'lainnya';
}

const categoryIcons: Record<CategoryTab, React.ReactNode> = {
  semua: <Zap size={14} />,
  game: <Gamepad2 size={14} />,
  ewallet: <Wallet size={14} />,
  pulsa: <span className="text-xs">📶</span>,
  lainnya: <span className="text-xs">⚡</span>,
};

const categoryLabels: Record<CategoryTab, string> = {
  semua: 'Semua', game: 'Game', ewallet: 'E-Wallet', pulsa: 'Pulsa & Data', lainnya: 'Lainnya',
};

export default function PpobPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryTab>('semua');
  const [activeBrand, setActiveBrand] = useState<string>('semua');

  // Selected product flow
  const [selected, setSelected] = useState<Product | null>(null);
  const [target, setTarget] = useState('');
  const [targetInfo, setTargetInfo] = useState<{ name: string; status: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ppob/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || 'Gagal memuat produk PPOB');
        console.error('PPOB page error:', data.message);
      }
    } catch (err) {
      console.error('PPOB fetch error:', err);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Derived state
  const tabs: CategoryTab[] = ['semua', 'game', 'ewallet', 'pulsa', 'lainnya'];
  const availableTabs = tabs.filter(t => t === 'semua' || products.some(p => getCategoryTab(p.category) === t));

  const filtered = products.filter(p => {
    const tab = getCategoryTab(p.category);
    const matchTab = activeTab === 'semua' || tab === activeTab;
    const matchBrand = activeBrand === 'semua' || p.brand.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.note.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchBrand && matchSearch;
  });

  // Brands within active tab
  const brandsInTab = activeTab === 'semua'
    ? []
    : Array.from(new Set(products.filter(p => getCategoryTab(p.category) === activeTab).map(p => p.brand.toLowerCase())));

  // Group filtered by brand
  const grouped: Record<string, Product[]> = {};
  filtered.forEach(p => {
    const key = getBrandLabel(p.brand);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  const isGame = selected ? getCategoryTab(selected.category) === 'game' : false;
  const isEwallet = selected ? getCategoryTab(selected.category) === 'ewallet' : false;
  const needsCheck = isGame || isEwallet;

  const checkTarget = async () => {
    if (!selected || !target.trim()) { toast.error('Masukkan nomor/ID tujuan dulu.'); return; }
    setChecking(true);
    setTargetInfo(null);
    try {
      let res;
      if (isGame) {
        res = await fetch(`/api/ppob/check-game?account_code=${selected.brand.toLowerCase()}&account_number=${encodeURIComponent(target.trim())}`);
      } else {
        res = await fetch(`/api/ppob/check-rekening?bank_code=${selected.brand.toLowerCase()}&account_number=${encodeURIComponent(target.trim())}`);
      }
      const data = await res.json();
      if (data.success && data.data?.status === 'valid') {
        setTargetInfo({ name: data.data.account_name, status: 'valid' });
        toast.success(`Akun valid: ${data.data.account_name}`);
      } else {
        setTargetInfo({ name: '', status: 'invalid' });
        toast.error('Nomor/ID tidak valid atau tidak ditemukan.');
      }
    } finally { setChecking(false); }
  };

  const handleOrder = async () => {
    if (!selected || !target.trim()) return;
    if (needsCheck && !targetInfo) { toast.error('Cek nomor tujuan dulu sebelum beli.'); return; }
    if (needsCheck && targetInfo?.status !== 'valid') { toast.error('Nomor tujuan tidak valid.'); return; }

    setOrdering(true);
    try {
      const res = await fetch('/api/ppob/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: selected.code,
          productName: selected.name,
          productNote: selected.note,
          productType: selected.type,
          productBrand: selected.brand,
          productCategory: selected.category,
          target: target.trim(),
          targetName: targetInfo?.name || null,
          price: selected.price,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) { toast.error('Login dulu ya!'); return; }
        toast.error(data.message); return;
      }
      toast.success('Transaksi berhasil dibuat!');
      setOrderResult({
        transaksiId: data.order.transaksiId,
        productName: data.order.productName,
        productNote: data.order.productNote,
        productBrand: selected.brand,
        productCategory: selected.category,
        target: data.order.target,
        targetName: targetInfo?.name || null,
        price: data.order.price,
        status: data.order.status,
        refund: false, sn: null,
      });
      setSelected(null); setTarget(''); setTargetInfo(null);
    } finally { setOrdering(false); }
  };

  const handleCheckStatus = async () => {
    if (!orderResult) return;
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/ppob/order-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaksiId: orderResult.transaksiId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderResult(data.order);
        if (data.order.status === 'success') toast.success('Transaksi berhasil!');
        else if (data.order.status === 'failed') toast.error('Transaksi gagal. Saldo dikembalikan jika refund.');
        else toast(`Status: ${data.order.status}`);
      }
    } finally { setCheckingStatus(false); }
  };

  const statusBadge = (status: string) => {
    if (status === 'success') return <span className="badge-success"><CheckCircle size={11} />Sukses</span>;
    if (status === 'failed' || status === 'canceled') return <span className="badge-failed"><XCircle size={11} />{status}</span>;
    return <span className="badge-pending"><RefreshCw size={11} className="animate-spin" />{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PPOB — Bayar & Top Up</h1>
            <p className="text-sm text-gray-500">Game, E-Wallet, Pulsa • Dibayar pakai saldo Nokos</p>
          </div>
        </div>

        {/* Order Result Panel */}
        {orderResult && (
          <div className={`card mb-6 border-2 ${
            orderResult.status === 'success' ? 'border-green-200 bg-green-50' :
            orderResult.status === 'failed' || orderResult.status === 'canceled' ? 'border-red-200 bg-red-50' :
            'border-purple-200 bg-purple-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900 text-sm">Hasil Transaksi</span>
              <button onClick={() => setOrderResult(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div><span className="text-gray-500 text-xs">Produk</span><p className="font-semibold text-gray-900">{orderResult.productNote || orderResult.productName}</p></div>
              <div><span className="text-gray-500 text-xs">Tujuan</span><p className="font-mono font-semibold">{orderResult.target}</p></div>
              {orderResult.targetName && <div><span className="text-gray-500 text-xs">Nama</span><p className="font-medium">{orderResult.targetName}</p></div>}
              <div><span className="text-gray-500 text-xs">Harga</span><p className="font-bold text-purple-600">{formatRupiah(orderResult.price)}</p></div>
              <div><span className="text-gray-500 text-xs">Status</span><div className="mt-0.5">{statusBadge(orderResult.status)}</div></div>
              {orderResult.sn && (
                <div className="col-span-2">
                  <span className="text-gray-500 text-xs">Serial Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono text-xs text-green-700 bg-green-100 px-2 py-1 rounded-lg flex-1 truncate">{orderResult.sn}</p>
                    <button onClick={() => { navigator.clipboard.writeText(orderResult.sn!); toast.success('SN disalin!'); }}>
                      <Copy size={13} className="text-gray-400 hover:text-green-600" />
                    </button>
                  </div>
                </div>
              )}
              {orderResult.refund && (
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle size={10} /> Saldo sudah dikembalikan
                  </span>
                </div>
              )}
            </div>
            <button onClick={handleCheckStatus} disabled={checkingStatus || orderResult.status === 'success'}
              className="btn-secondary w-full py-2 text-sm">
              {checkingStatus ? <span className="spinner spinner-brand" /> : <><RefreshCw size={13} />Cek Status Transaksi</>}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 bg-white" placeholder="Cari produk (mis: Free Fire, DANA, Telkomsel...)"
            value={search} onChange={e => { setSearch(e.target.value); setActiveTab('semua'); setActiveBrand('semua'); }} />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-3">
          {availableTabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setActiveBrand('semua'); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
              }`}>
              {categoryIcons[tab]}{categoryLabels[tab]}
            </button>
          ))}
        </div>

        {/* Brand sub-filter */}
        {activeTab !== 'semua' && brandsInTab.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={() => setActiveBrand('semua')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeBrand === 'semua' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              Semua
            </button>
            {brandsInTab.map(brand => (
              <button key={brand} onClick={() => setActiveBrand(brand)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${activeBrand === brand ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                {getBrandLabel(brand)}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap size={36} className="mx-auto mb-3 opacity-30" />
            <p>Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(grouped).map(([brandLabel, prods]) => (
              <div key={brandLabel}>
                <div className="flex items-center gap-2 mb-3">
                  {prods[0].img_url && (
                    <Image src={prods[0].img_url} alt={brandLabel} width={22} height={22} className="rounded object-contain" />
                  )}
                  <h2 className="font-bold text-gray-800 text-sm">{brandLabel}</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{prods.length} produk</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prods.map(p => (
                    <button key={p.code} onClick={() => { setSelected(p); setTarget(''); setTargetInfo(null); }}
                      className="card text-left hover:border-purple-300 hover:shadow-md transition-all flex items-start gap-3 group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                        {p.img_url
                          ? <Image src={p.img_url} alt={p.name} width={48} height={48} className="object-contain" />
                          : <Zap size={20} className="text-gray-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{p.note}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-purple-600 text-sm">{formatRupiah(p.price)}</span>
                          {p.price_info.price_discount_percent > 0 && (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                              -{p.price_info.price_discount_percent}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-purple-400 mt-1 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}>
            {/* Product Info */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                {selected.img_url
                  ? <Image src={selected.img_url} alt={selected.name} width={56} height={56} className="object-contain" />
                  : <Zap size={24} className="text-gray-300" />
                }
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{selected.note || selected.name}</p>
                <p className="text-xs text-gray-500">{getBrandLabel(selected.brand)} • {selected.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-purple-600">{formatRupiah(selected.price)}</span>
                  {selected.price_info.price_discount_percent > 0 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">{formatRupiah(selected.price_info.price_original)}</span>
                      <span className="text-xs text-green-600 font-medium">-{selected.price_info.price_discount_percent}%</span>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Target Input */}
            <div className="mb-4">
              <label className="label">
                {isGame ? 'ID Akun Game' : isEwallet ? 'Nomor Rekening/HP' : 'Nomor Tujuan'}
              </label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder={isGame ? 'Masukkan ID akun game' : 'Masukkan nomor HP/rekening'}
                  value={target}
                  onChange={e => { setTarget(e.target.value); setTargetInfo(null); }}
                />
                {needsCheck && (
                  <button onClick={checkTarget} disabled={checking || !target.trim()}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0">
                    {checking ? <span className="spinner spinner-brand" /> : 'Cek'}
                  </button>
                )}
              </div>

              {/* Target validation result */}
              {targetInfo && (
                <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  targetInfo.status === 'valid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {targetInfo.status === 'valid'
                    ? <><CheckCircle size={14} /><span className="font-medium">{targetInfo.name}</span></>
                    : <><XCircle size={14} /><span>Nomor tidak valid</span></>
                  }
                </div>
              )}

              {/* Info if needsCheck but not checked yet */}
              {needsCheck && !targetInfo && target && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> Klik Cek untuk verifikasi {isGame ? 'ID game' : 'nomor rekening'}
                </p>
              )}
            </div>

            {/* Info saldo */}
            <div className="bg-purple-50 rounded-xl p-3 mb-4 text-xs text-purple-700">
              💡 Transaksi ini menggunakan <strong>Saldo Nokos</strong>. Pastikan saldo mencukupi sebelum beli.
            </div>

            <button
              onClick={handleOrder}
              disabled={ordering || !target.trim() || (needsCheck && targetInfo?.status !== 'valid')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {ordering ? <span className="spinner" /> : `Beli ${formatRupiah(selected.price)}`}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
