'use client';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  Zap, Search, RefreshCw, X, CheckCircle, XCircle,
  Gamepad2, Wallet, ChevronRight, Copy, AlertCircle, Crosshair, TerminalSquare
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
  semua: <Crosshair size={14} />,
  game: <Gamepad2 size={14} />,
  ewallet: <Wallet size={14} />,
  pulsa: <span className="text-xs font-mono">📶</span>,
  lainnya: <span className="text-xs font-mono">⚡</span>,
};

const categoryLabels: Record<CategoryTab, string> = {
  semua: 'ALL_NODES', game: 'GAME', ewallet: 'E-WALLET', pulsa: 'CELLULAR', lainnya: 'OTHERS',
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
        toast.error(data.message || 'Error: PPOB module offline');
      }
    } catch (err) {
      toast.error('System Error: Connection failed.');
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
    if (!selected || !target.trim()) { toast.error('Require Target ID/Number.'); return; }
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
        toast.success(`Target Verified: ${data.data.account_name}`);
      } else {
        setTargetInfo({ name: '', status: 'invalid' });
        toast.error('Target invalid or not found.');
      }
    } finally { setChecking(false); }
  };

  const handleOrder = async () => {
    if (!selected || !target.trim()) return;
    if (needsCheck && !targetInfo) { toast.error('Verification required before execution.'); return; }
    if (needsCheck && targetInfo?.status !== 'valid') { toast.error('Invalid target node.'); return; }

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
        if (res.status === 401) { toast.error('System Auth Failed: Login Required'); return; }
        toast.error(data.message); return;
      }
      toast.success('Sequence executed successfully!');
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
        if (data.order.status === 'success') toast.success('Execution Complete!');
        else if (data.order.status === 'failed') toast.error('Execution Failed. Funds restored if refunded.');
        else toast(`System Status: ${data.order.status.toUpperCase()}`);
      }
    } finally { setCheckingStatus(false); }
  };

  const statusBadge = (status: string) => {
    if (status === 'success') return <span className="badge-success"><CheckCircle size={11} />SUCCESS</span>;
    if (status === 'failed' || status === 'canceled') return <span className="badge-failed"><XCircle size={11} />{status.toUpperCase()}</span>;
    return <span className="badge-pending"><RefreshCw size={11} className="animate-spin" />{status.toUpperCase()}</span>;
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
            <Zap className="text-red-500 animate-pulse" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              PPOB_Node
            </h1>
          </div>
          <p className="text-red-500 font-mono text-xs pl-10">{'>>'} Top-Up Gateway // Billed to Nokos_Credits</p>
        </div>

        {/* Order Result Panel */}
        {orderResult && (
          <div className={`mb-8 border-l-4 p-5 relative overflow-hidden shadow-lg ${
            orderResult.status === 'success' ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-900/20' :
            orderResult.status === 'failed' || orderResult.status === 'canceled' ? 'border-red-500 bg-red-950/20 shadow-red-900/20' :
            'border-amber-500 bg-amber-950/20 shadow-amber-900/20'
          }`}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
                <span className="font-black font-mono uppercase tracking-widest text-white text-sm">Execution_Log</span>
                <button onClick={() => setOrderResult(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-5">
                <div><span className="text-zinc-500 block mb-1 uppercase">Module:</span><p className="font-bold text-white uppercase">{orderResult.productNote || orderResult.productName}</p></div>
                <div><span className="text-zinc-500 block mb-1 uppercase">Target:</span><p className="font-bold text-red-400 text-sm tracking-widest">{orderResult.target}</p></div>
                {orderResult.targetName && <div><span className="text-zinc-500 block mb-1 uppercase">Verified_ID:</span><p className="text-white uppercase">{orderResult.targetName}</p></div>}
                <div><span className="text-zinc-500 block mb-1 uppercase">Cost:</span><p className="font-bold text-red-500 text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(orderResult.price)}</p></div>
                <div><span className="text-zinc-500 block mb-1 uppercase">Sys_Status:</span><div className="mt-1">{statusBadge(orderResult.status)}</div></div>
                
                {orderResult.sn && (
                  <div className="col-span-2">
                    <span className="text-zinc-500 block mb-1 uppercase">Serial_Number:</span>
                    <div className="flex items-center justify-between bg-zinc-950 border border-emerald-900/50 px-3 py-2">
                      <p className="font-mono text-xs text-emerald-400 tracking-widest truncate">{orderResult.sn}</p>
                      <button onClick={() => { navigator.clipboard.writeText(orderResult.sn!); toast.success('SN Copied!'); }} className="text-emerald-600 hover:text-emerald-400 transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {orderResult.refund && (
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 uppercase tracking-widest border border-emerald-900/50 bg-emerald-950/30 px-2 py-1">
                      <CheckCircle size={10} /> Funds_Restored_To_Balance
                    </span>
                  </div>
                )}
              </div>
              
              <button onClick={handleCheckStatus} disabled={checkingStatus || orderResult.status === 'success'}
                className="btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2 group relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                {checkingStatus ? <span className="spinner border-red-500/30 border-t-red-500" /> : <><RefreshCw size={14} /> Ping_Status</>}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10"></div>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
          <input className="input pl-11 bg-zinc-950/80 backdrop-blur-sm border-zinc-800/80 focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white font-mono" 
            placeholder="Search module (e.g., Free Fire, DANA)..."
            value={search} onChange={e => { setSearch(e.target.value); setActiveTab('semua'); setActiveBrand('semua'); }} />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-4 border-l-2 border-red-600 pl-3 bg-zinc-950/50 p-2">
          {availableTabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setActiveBrand('semua'); }}
              className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all border ${
                activeTab === tab
                  ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)] font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-red-500/30 hover:text-red-400'
              }`}>
              {categoryIcons[tab]}{categoryLabels[tab]}
            </button>
          ))}
        </div>

        {/* Brand sub-filter */}
        {activeTab !== 'semua' && brandsInTab.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6 pl-4 border-l border-zinc-800">
            <button onClick={() => setActiveBrand('semua')}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-all ${activeBrand === 'semua' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}>
              ALL
            </button>
            {brandsInTab.map(brand => (
              <button key={brand} onClick={() => setActiveBrand(brand)}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-all ${activeBrand === brand ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}>
                {getBrandLabel(brand)}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="card-product h-32 animate-pulse bg-zinc-900/50 border-zinc-800" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 bg-zinc-900/30">
            <TerminalSquare size={40} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">{'>>'} DATA_NOT_FOUND</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([brandLabel, prods]) => (
              <div key={brandLabel}>
                <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-2">
                  {prods[0].img_url && (
                    <div className="bg-zinc-900 p-1 border border-zinc-800">
                      <Image src={prods[0].img_url} alt={brandLabel} width={20} height={20} className="object-contain" />
                    </div>
                  )}
                  <h2 className="font-bold font-mono text-white text-sm uppercase tracking-widest">{brandLabel}</h2>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">[{prods.length} Nodes]</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prods.map(p => (
                    <button key={p.code} onClick={() => { setSelected(p); setTarget(''); setTargetInfo(null); }}
                      className="card-product text-left flex items-start gap-4 group">
                      <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-red-500/50 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-10 pointer-events-none opacity-50" />
                        {p.img_url
                          ? <Image src={p.img_url} alt={p.name} width={36} height={36} className="object-contain grayscale-[30%] group-hover:grayscale-0 transition-all relative z-0" />
                          : <Zap size={20} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold font-mono text-white text-sm uppercase tracking-wide leading-tight truncate group-hover:text-red-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1 truncate uppercase tracking-widest">{p.note}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="font-black font-mono text-red-500 text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(p.price)}</span>
                          {p.price_info.price_discount_percent > 0 && (
                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 px-1.5 py-0.5 uppercase tracking-widest">
                              -{p.price_info.price_discount_percent}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-700 group-hover:text-red-500 mt-1 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Modal (Mecha Terminal Style) */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-zinc-900 border border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.2)] p-6 w-full max-w-md relative overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}>
            
            {/* Tech Corners */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

            <div className="relative z-10">
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-red-900/50">
                <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-10 pointer-events-none" />
                  {selected.img_url
                    ? <Image src={selected.img_url} alt={selected.name} width={40} height={40} className="object-contain relative z-0" />
                    : <Zap size={24} className="text-zinc-500" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-black font-mono text-white text-sm uppercase tracking-wide leading-snug">{selected.note || selected.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">{getBrandLabel(selected.brand)} // {selected.category}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-black font-mono text-red-500 text-base drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(selected.price)}</span>
                    {selected.price_info.price_discount_percent > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-600 line-through">{formatRupiah(selected.price_info.price_original)}</span>
                        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest border border-emerald-900/50 bg-emerald-950/20 px-1">-{selected.price_info.price_discount_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-red-500 transition-colors flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              {/* Target Input */}
              <div className="mb-6">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">
                  {'>>'} {isGame ? 'Target_Game_ID' : isEwallet ? 'Target_Wallet/Phone' : 'Target_Number'}
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder-zinc-700"
                    placeholder={isGame ? 'Enter Game ID' : 'Enter Number/ID'}
                    value={target}
                    onChange={e => { setTarget(e.target.value); setTargetInfo(null); }}
                  />
                  {needsCheck && (
                    <button onClick={checkTarget} disabled={checking || !target.trim()}
                      className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-zinc-500 font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex-shrink-0">
                      {checking ? <span className="spinner border-white/30 border-t-white" /> : 'Verify'}
                    </button>
                  )}
                </div>

                {/* Target validation result */}
                {targetInfo && (
                  <div className={`mt-3 flex items-center gap-2 px-3 py-2 border text-xs font-mono uppercase tracking-widest ${
                    targetInfo.status === 'valid' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500' : 'bg-red-950/30 border-red-900/50 text-red-500'
                  }`}>
                    {targetInfo.status === 'valid'
                      ? <><CheckCircle size={14} /><span className="font-bold truncate">{targetInfo.name}</span></>
                      : <><XCircle size={14} /><span>Invalid_Target</span></>
                    }
                  </div>
                )}

                {/* Info if needsCheck but not checked yet */}
                {needsCheck && !targetInfo && target && (
                  <p className="text-[10px] font-mono text-amber-500 mt-2 flex items-center gap-1.5 uppercase tracking-widest">
                    <AlertCircle size={12} className="animate-pulse" /> Verify target ID before execution.
                  </p>
                )}
              </div>

              {/* Info saldo */}
              <div className="bg-zinc-950 border border-zinc-800 p-3 mb-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-start gap-2">
                <span className="text-red-500 mt-0.5">{'>>'}</span>
                <p>This execution utilizes <strong className="text-white font-black">Nokos_Credits</strong>. Ensure sufficient balance prior to authorization.</p>
              </div>

              <button
                onClick={handleOrder}
                disabled={ordering || !target.trim() || (needsCheck && targetInfo?.status !== 'valid')}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                {ordering ? <span className="spinner border-white/30 border-t-white" /> : `Execute // ${formatRupiah(selected.price)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
