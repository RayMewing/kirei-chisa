'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, X, Package, ChevronDown, ChevronUp, Tag, TerminalSquare, Crosshair, Server } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { formatRupiah } from '@/lib/utils';

interface Account { email: string; password: string; notes: string; sold: boolean; }
interface CustomProduct { _id: string; name: string; description: string; imageBase64: string; price: number; category: string; isActive: boolean; accounts: Account[]; }
interface PremkuProduct { id: number; name: string; price: number; status: string; }

export default function AdminProductsPage() {
  const [tab, setTab] = useState<'custom' | 'premku'>('custom');

  // Custom products
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newProd, setNewProd] = useState({ name: '', description: '', imageBase64: '', price: '', category: '' });
  const [addingProd, setAddingProd] = useState(false);
  const [newAccount, setNewAccount] = useState<Record<string, { email: string; password: string; notes: string }>>({});
  const [addingAcc, setAddingAcc] = useState<string | null>(null);

  // Premku pricing
  const [premkuProducts, setPremkuProducts] = useState<PremkuProduct[]>([]);
  const [premkuPricing, setPremkuPricing] = useState<Record<string, number>>({});
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [savingPrice, setSavingPrice] = useState<number | null>(null);
  const [loadingPremku, setLoadingPremku] = useState(false);

  useEffect(() => {
    fetch('/api/admin/custom-products').then(r => r.json()).then(d => {
      if (d.success) setProducts(d.products);
    }).finally(() => setLoadingProds(false));
  }, []);

  useEffect(() => {
    if (tab !== 'premku') return;
    setLoadingPremku(true);
    Promise.all([
      fetch('/api/premku/products').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([prodData, settData]) => {
      if (prodData.success) setPremkuProducts(prodData.products);
      if (settData.success && settData.settings.premku_pricing)
        setPremkuPricing(settData.settings.premku_pricing as Record<string, number>);
    }).finally(() => setLoadingPremku(false));
  }, [tab]);

  const handleAddProduct = async () => {
    if (!newProd.name || !newProd.price) { toast.error('Nama dan Harga wajib diisi.'); return; }
    setAddingProd(true);
    const res = await fetch('/api/admin/custom-products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...newProd, price: parseInt(newProd.price) }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Modul berhasil diluncurkan!');
      setProducts(p => [d.product, ...p]);
      setNewProd({ name: '', description: '', imageBase64: '', price: '', category: '' });
      setShowAddForm(false);
    } else toast.error(d.message);
    setAddingProd(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus modul ini dari database?')) return;
    const res = await fetch('/api/admin/custom-products', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const d = await res.json();
    if (d.success) { toast.success('Modul dihapus.'); setProducts(p => p.filter(x => x._id !== id)); }
    else toast.error(d.message);
  };

  const handleToggleActive = async (product: CustomProduct) => {
    const res = await fetch('/api/admin/custom-products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product._id, isActive: !product.isActive }),
    });
    const d = await res.json();
    if (d.success) setProducts(p => p.map(x => x._id === product._id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleAddAccount = async (productId: string) => {
    const acc = newAccount[productId];
    if (!acc?.email || !acc?.password) { toast.error('ID dan Sandi wajib diisi.'); return; }
    setAddingAcc(productId);
    const res = await fetch('/api/admin/custom-products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_account', productId, ...acc }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Data dimasukkan ke inventaris!');
      setProducts(p => p.map(x => x._id === productId ? d.product : x));
      setNewAccount(n => ({ ...n, [productId]: { email: '', password: '', notes: '' } }));
    } else toast.error(d.message);
    setAddingAcc(null);
  };

  const handleDeleteAccount = async (productId: string, idx: number) => {
    if (!confirm('Hapus data ini dari inventaris?')) return;
    const res = await fetch('/api/admin/custom-products', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, accountIndex: idx }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Data dihapus.');
      setProducts(p => p.map(x => {
        if (x._id !== productId) return x;
        return { ...x, accounts: x.accounts.filter((_, i) => i !== idx) };
      }));
    } else toast.error(d.message);
  };

  const savePremkuPrice = async (productId: number) => {
    const priceStr = editingPrices[String(productId)];
    const price = parseInt(priceStr);
    if (!priceStr || isNaN(price)) { toast.error('Parameter tidak valid.'); return; }
    setSavingPrice(productId);
    const newPricing = { ...premkuPricing, [String(productId)]: price };
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'premku_pricing', value: newPricing }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Parameter harga diperbarui!');
      setPremkuPricing(newPricing);
      setEditingPrices(e => { const n = { ...e }; delete n[String(productId)]; return n; });
    } else toast.error(d.message);
    setSavingPrice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <Package className="text-red-500" size={28} />
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Manajer Modul
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{'>>'} Kendali Inventaris Database</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-l-2 border-red-600 pl-3 bg-zinc-950/50 p-2 overflow-x-auto custom-scrollbar">
        {[['custom', 'Produk Kustom'], ['premku', 'Harga Premku API']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as 'custom' | 'premku')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              tab === id 
                ? 'bg-red-950/30 text-red-500 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Custom Products Tab */}
      {tab === 'custom' && (
        <div className="space-y-6">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-3 text-xs w-full sm:w-auto">
            {showAddForm ? <><X size={14} /> Batalkan Peluncuran</> : <><Plus size={14} /> Luncurkan Modul Baru</>}
          </button>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-zinc-900/80 backdrop-blur-md p-6 border border-red-500/50 relative shadow-[0_0_20px_rgba(220,38,38,0.1)]">
              {/* Tech Corners */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
              
              <h2 className="font-black font-mono text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                <TerminalSquare size={16} className="text-red-500" /> Konstruksi Modul
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="sm:col-span-2 bg-zinc-950 border border-zinc-800 p-4">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">{'>>'} Aset Visual</p>
                  <ImageUpload value={newProd.imageBase64} onChange={v => setNewProd(p => ({ ...p, imageBase64: v }))}
                    label="" aspectRatio="16/9" maxSizeMB={2} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} ID Modul (Nama)</label>
                  <input className="input" placeholder="contoh: Akun Premium" value={newProd.name}
                    onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Biaya Dasar (Rp)</label>
                  <input type="number" className="input" placeholder="contoh: 35000" value={newProd.price}
                    onChange={e => setNewProd(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Label Kategori</label>
                  <input className="input" placeholder="contoh: Hiburan" value={newProd.category}
                    onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Parameter (Deskripsi)</label>
                  <input className="input" placeholder="contoh: Garansi 30 Hari" value={newProd.description}
                    onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddProduct} disabled={addingProd} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 transition-all flex items-center justify-center gap-2">
                {addingProd ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={14} /> Simpan Modul</>}
              </button>
            </div>
          )}

          {/* Products List */}
          {loadingProds ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
              <Server size={40} className="mx-auto mb-4 text-zinc-700 animate-pulse" />
              <p className="font-mono text-zinc-500 uppercase tracking-widest text-sm">{'>>'} INVENTARIS KOSONG</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(product => {
                const availableStock = product.accounts.filter(a => !a.sold).length;
                const soldStock = product.accounts.filter(a => a.sold).length;
                const isExpanded = expandedId === product._id;
                const acc = newAccount[product._id] ?? { email: '', password: '', notes: '' };

                return (
                  <div key={product._id} className={`bg-zinc-900 border transition-all relative overflow-hidden ${product.isActive ? 'border-zinc-700 hover:border-red-500/50' : 'border-zinc-800 opacity-60'}`}>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
                    
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 relative z-10">
                      {/* Image */}
                      <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                        {product.imageBase64
                          ? <Image src={product.imageBase64} alt={product.name} fill className="object-cover grayscale-[30%]" sizes="64px" />
                          : <Package size={24} className="text-zinc-600" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <p className="font-black font-mono text-white text-sm uppercase tracking-wide truncate">{product.name}</p>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1 truncate uppercase tracking-widest">{product.description}</p>
                            
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <span className="font-black font-mono text-red-500 text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(product.price)}</span>
                              <span className="text-[10px] font-mono bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 px-2 py-0.5 uppercase tracking-widest">
                                Tersedia: {availableStock}
                              </span>
                              {soldStock > 0 && (
                                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 uppercase tracking-widest">
                                  Terjual: {soldStock}
                                </span>
                              )}
                              <span className="text-[10px] font-mono bg-red-950/30 text-red-400 border border-red-900/50 px-2 py-0.5 uppercase tracking-widest">{product.category}</span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                            <button onClick={() => handleToggleActive(product)}
                              className={`flex-1 sm:flex-none text-[10px] font-mono uppercase tracking-widest px-3 py-2 transition-all border ${product.isActive ? 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50 hover:bg-emerald-900/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}>
                              {product.isActive ? 'Online' : 'Offline'}
                            </button>
                            <button onClick={() => setExpandedId(isExpanded ? null : product._id)}
                              className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-all">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/50 hover:text-white transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: Stok Management */}
                    {isExpanded && (
                      <div className="border-t border-zinc-800 bg-zinc-950/50 p-4 sm:p-5 space-y-5 relative z-10">
                        {/* Add Account Form */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4">
                          <p className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Plus size={12} className="text-red-500" /> Masukkan Data Kredensial Baru
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input className="input" placeholder="ID / Email" value={acc.email}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, email: e.target.value } }))} />
                            <input className="input" placeholder="Kata Sandi" value={acc.password}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, password: e.target.value } }))} />
                            <input className="input" placeholder="Catatan Tambahan (Opsional)" value={acc.notes}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, notes: e.target.value } }))} />
                          </div>
                          <button onClick={() => handleAddAccount(product._id)} disabled={addingAcc === product._id}
                            className="btn-secondary w-full sm:w-auto mt-3 text-xs py-2 px-6">
                            {addingAcc === product._id ? <span className="spinner border-red-500/30 border-t-red-500" /> : 'Eksekusi Injeksi'}
                          </button>
                        </div>

                        {/* Account List */}
                        {product.accounts.length > 0 && (
                          <div>
                            <p className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Server size={12} className="text-red-500" /> Data Inventaris Aktif [{product.accounts.length}]
                            </p>
                            <div className="space-y-2">
                              {product.accounts.map((a, idx) => (
                                <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 border text-xs font-mono transition-colors ${a.sold ? 'bg-zinc-950 border-zinc-800 text-zinc-600' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-red-500/30'}`}>
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className={`w-1.5 h-1.5 flex-shrink-0 animate-pulse ${a.sold ? 'bg-zinc-700' : 'bg-emerald-500'}`} />
                                    <span className="truncate text-white font-bold">{a.email}</span>
                                    <span className="text-zinc-600 mx-1">||</span>
                                    <span className="truncate text-zinc-400">{a.password}</span>
                                  </div>
                                  
                                  {a.notes && <span className="text-zinc-500 truncate flex-1 sm:border-l sm:border-zinc-800 sm:pl-3">{a.notes}</span>}
                                  
                                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${a.sold ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50'}`}>
                                      {a.sold ? 'Dikonsumsi' : 'Siap'}
                                    </span>
                                    {!a.sold && (
                                      <button onClick={() => handleDeleteAccount(product._id, idx)}
                                        className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-900/50 transition-all flex-shrink-0">
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Premku Pricing Tab */}
      {tab === 'premku' && (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-500/50 p-4 text-[10px] font-mono text-amber-500 uppercase tracking-widest flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Tag size={16} className="flex-shrink-0 animate-pulse" />
            <p>Konfigurasi parameter harga eceran untuk modul API Premku. Biarkan kosong untuk mewarisi harga asli API. Pengguna akan ditagih berdasarkan parameter eceran yang ditentukan.</p>
          </div>

          {loadingPremku ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}</div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
              <table className="w-full relative z-10">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-5 py-4">ID Modul</th>
                    <th className="text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-5 py-4">Harga Asli Pusat</th>
                    <th className="text-left text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-5 py-4">Parameter Harga Jual</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {premkuProducts.map(p => {
                    const customPrice = premkuPricing[String(p.id)];
                    const isEditing = editingPrices[String(p.id)] !== undefined;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold font-mono text-white uppercase tracking-wide">{p.name}</p>
                          <span className={`text-[10px] font-mono uppercase tracking-widest mt-1 block ${p.status === 'available' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                            {p.status === 'available' ? '>> ONLINE' : '>> OFFLINE'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-zinc-400 font-mono">{formatRupiah(p.price)}</td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input type="number" className="input text-sm w-32 py-2" value={editingPrices[String(p.id)]}
                              onChange={e => setEditingPrices(ep => ({ ...ep, [String(p.id)]: e.target.value }))} />
                          ) : (
                            <span className={`text-xs font-mono font-black ${customPrice ? 'text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'text-zinc-600'}`}>
                              {customPrice ? formatRupiah(customPrice) : '[MENGIKUTI PUSAT]'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            {isEditing ? (
                              <>
                                <button onClick={() => savePremkuPrice(p.id)} disabled={savingPrice === p.id}
                                  className="p-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/50 transition-colors">
                                  {savingPrice === p.id ? <span className="spinner border-emerald-500/30 border-t-emerald-500 scale-75" /> : <Save size={14} />}
                                </button>
                                <button onClick={() => setEditingPrices(ep => { const n = { ...ep }; delete n[String(p.id)]; return n; })}
                                  className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setEditingPrices(ep => ({ ...ep, [String(p.id)]: customPrice ? String(customPrice) : String(p.price) }))}
                                className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50 transition-colors">
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
