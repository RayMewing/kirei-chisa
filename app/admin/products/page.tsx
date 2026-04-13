'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, X, Package, ChevronDown, ChevronUp, Tag } from 'lucide-react';
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
    if (!newProd.name || !newProd.price) { toast.error('Nama dan harga wajib.'); return; }
    setAddingProd(true);
    const res = await fetch('/api/admin/custom-products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...newProd, price: parseInt(newProd.price) }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Produk ditambahkan!');
      setProducts(p => [d.product, ...p]);
      setNewProd({ name: '', description: '', imageBase64: '', price: '', category: '' });
      setShowAddForm(false);
    } else toast.error(d.message);
    setAddingProd(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const res = await fetch('/api/admin/custom-products', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const d = await res.json();
    if (d.success) { toast.success('Produk dihapus.'); setProducts(p => p.filter(x => x._id !== id)); }
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
    if (!acc?.email || !acc?.password) { toast.error('Email dan password wajib.'); return; }
    setAddingAcc(productId);
    const res = await fetch('/api/admin/custom-products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_account', productId, ...acc }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Akun ditambahkan ke stok!');
      setProducts(p => p.map(x => x._id === productId ? d.product : x));
      setNewAccount(n => ({ ...n, [productId]: { email: '', password: '', notes: '' } }));
    } else toast.error(d.message);
    setAddingAcc(null);
  };

  const handleDeleteAccount = async (productId: string, idx: number) => {
    if (!confirm('Hapus akun ini dari stok?')) return;
    const res = await fetch('/api/admin/custom-products', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, accountIndex: idx }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Akun dihapus.');
      setProducts(p => p.map(x => {
        if (x._id !== productId) return x;
        return { ...x, accounts: x.accounts.filter((_, i) => i !== idx) };
      }));
    } else toast.error(d.message);
  };

  const savePremkuPrice = async (productId: number) => {
    const priceStr = editingPrices[String(productId)];
    const price = parseInt(priceStr);
    if (!priceStr || isNaN(price)) { toast.error('Harga tidak valid.'); return; }
    setSavingPrice(productId);
    const newPricing = { ...premkuPricing, [String(productId)]: price };
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'premku_pricing', value: newPricing }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Harga disimpan!');
      setPremkuPricing(newPricing);
      setEditingPrices(e => { const n = { ...e }; delete n[String(productId)]; return n; });
    } else toast.error(d.message);
    setSavingPrice(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-gray-900">Kelola Produk 📦</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['custom', '🎁 Produk Custom', 'custom'], ['premku', '🏪 Harga Premku', 'premku']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as 'custom' | 'premku')}
            className={`px-4 py-2 rounded-2xl text-sm font-black transition-all border-2 ${tab === id ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-pink-100 hover:border-brand/30'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Custom Products Tab */}
      {tab === 'custom' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-2.5 text-sm">
            <Plus size={15} />{showAddForm ? 'Tutup Form' : 'Tambah Produk Baru'}
          </button>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white rounded-3xl p-5 border-2 border-brand/20 space-y-4">
              <h2 className="font-black text-gray-900">Produk Baru ✨</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ImageUpload value={newProd.imageBase64} onChange={v => setNewProd(p => ({ ...p, imageBase64: v }))}
                    label="Foto Produk" aspectRatio="16/9" maxSizeMB={2} />
                </div>
                <div>
                  <label className="label">Nama Produk</label>
                  <input className="input" placeholder="Netflix Premium 1 Bulan" value={newProd.name}
                    onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input type="number" className="input" placeholder="35000" value={newProd.price}
                    onChange={e => setNewProd(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <input className="input" placeholder="Netflix / Spotify / Alight Motion ..." value={newProd.category}
                    onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Deskripsi</label>
                  <input className="input" placeholder="Akun private, garansi 30 hari" value={newProd.description}
                    onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddProduct} disabled={addingProd} className="btn-primary py-2.5">
                {addingProd ? <span className="spinner" /> : <><Plus size={14} />Simpan Produk</>}
              </button>
            </div>
          )}

          {/* Products List */}
          {loadingProds ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-3xl bg-pink-50 animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-gray-400 border border-pink-100">
              <Package size={36} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada produk custom.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => {
                const availableStock = product.accounts.filter(a => !a.sold).length;
                const soldStock = product.accounts.filter(a => a.sold).length;
                const isExpanded = expandedId === product._id;
                const acc = newAccount[product._id] ?? { email: '', password: '', notes: '' };

                return (
                  <div key={product._id} className={`bg-white rounded-3xl border-2 overflow-hidden transition-all ${product.isActive ? 'border-pink-100' : 'border-gray-100 opacity-60'}`}>
                    <div className="p-4 flex items-start gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-pink-50 flex-shrink-0 relative border border-pink-100">
                        {product.imageBase64
                          ? <Image src={product.imageBase64} alt={product.name} fill className="object-cover" sizes="64px" />
                          : <Package size={24} className="absolute inset-0 m-auto text-pink-200" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-black text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="font-black text-brand text-sm">{formatRupiah(product.price)}</span>
                              <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-bold">
                                {availableStock} tersedia
                              </span>
                              {soldStock > 0 && (
                                <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                                  {soldStock} terjual
                                </span>
                              )}
                              <span className="text-xs bg-pink-50 text-brand px-2 py-0.5 rounded-full border border-pink-100">{product.category}</span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => handleToggleActive(product)}
                              className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all border ${product.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                              {product.isActive ? 'Aktif' : 'Nonaktif'}
                            </button>
                            <button onClick={() => setExpandedId(isExpanded ? null : product._id)}
                              className="p-1.5 text-gray-400 hover:text-brand hover:bg-pink-50 rounded-xl transition-all">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button onClick={() => handleDeleteProduct(product._id)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: Stok Management */}
                    {isExpanded && (
                      <div className="border-t border-pink-50 bg-pink-50/30 p-4 space-y-4">
                        {/* Add Account Form */}
                        <div>
                          <p className="text-xs font-black text-gray-600 mb-2">➕ Tambah Akun ke Stok</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input className="input text-sm" placeholder="Email login" value={acc.email}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, email: e.target.value } }))} />
                            <input className="input text-sm" placeholder="Password" value={acc.password}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, password: e.target.value } }))} />
                            <input className="input text-sm" placeholder="Catatan (opsional)" value={acc.notes}
                              onChange={e => setNewAccount(n => ({ ...n, [product._id]: { ...acc, notes: e.target.value } }))} />
                          </div>
                          <button onClick={() => handleAddAccount(product._id)} disabled={addingAcc === product._id}
                            className="btn-primary mt-2 text-sm py-2">
                            {addingAcc === product._id ? <span className="spinner" /> : <><Plus size={13} />Tambah Akun</>}
                          </button>
                        </div>

                        {/* Account List */}
                        {product.accounts.length > 0 && (
                          <div>
                            <p className="text-xs font-black text-gray-600 mb-2">📋 Daftar Stok ({product.accounts.length})</p>
                            <div className="space-y-1.5">
                              {product.accounts.map((a, idx) => (
                                <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-mono ${a.sold ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-pink-100'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.sold ? 'bg-gray-300' : 'bg-green-400'}`} />
                                  <span className="flex-1 truncate">{a.email}</span>
                                  <span className="flex-1 truncate text-gray-400">{a.password}</span>
                                  {a.notes && <span className="text-gray-400 truncate">{a.notes}</span>}
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs flex-shrink-0 ${a.sold ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600'}`}>
                                    {a.sold ? 'Terjual' : 'Tersedia'}
                                  </span>
                                  {!a.sold && (
                                    <button onClick={() => handleDeleteAccount(product._id, idx)}
                                      className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                      <X size={12} />
                                    </button>
                                  )}
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
        <div className="space-y-4">
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-sm text-pink-700 flex gap-2">
            <Tag size={16} className="flex-shrink-0 mt-0.5" />
            <p>Set harga jual untuk produk Premku API. Biarkan kosong untuk menggunakan harga asli dari API. User akan membayar harga yang kamu set.</p>
          </div>

          {loadingPremku ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-pink-50 animate-pulse" />)}</div>
          ) : (
            <div className="bg-white rounded-3xl border border-pink-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-50 bg-pink-50/50">
                    <th className="text-left text-xs font-black text-gray-500 px-4 py-3">Produk</th>
                    <th className="text-left text-xs font-black text-gray-500 px-4 py-3">Harga API</th>
                    <th className="text-left text-xs font-black text-gray-500 px-4 py-3">Harga Jual</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {premkuProducts.map(p => {
                    const customPrice = premkuPricing[String(p.id)];
                    const isEditing = editingPrices[String(p.id)] !== undefined;
                    return (
                      <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-800">{p.name}</p>
                          <span className={`text-xs ${p.status === 'available' ? 'text-green-500' : 'text-gray-400'}`}>
                            {p.status === 'available' ? '● Tersedia' : '● Habis'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{formatRupiah(p.price)}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input type="number" className="input text-sm w-32 py-1.5" value={editingPrices[String(p.id)]}
                              onChange={e => setEditingPrices(ep => ({ ...ep, [String(p.id)]: e.target.value }))} />
                          ) : (
                            <span className={`text-sm font-black ${customPrice ? 'text-brand' : 'text-gray-300'}`}>
                              {customPrice ? formatRupiah(customPrice) : '— (pakai harga API)'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 justify-end">
                            {isEditing ? (
                              <>
                                <button onClick={() => savePremkuPrice(p.id)} disabled={savingPrice === p.id}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                                  {savingPrice === p.id ? <span className="spinner spinner-brand scale-75" /> : <Save size={14} />}
                                </button>
                                <button onClick={() => setEditingPrices(ep => { const n = { ...ep }; delete n[String(p.id)]; return n; })}
                                  className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setEditingPrices(ep => ({ ...ep, [String(p.id)]: customPrice ? String(customPrice) : String(p.price) }))}
                                className="p-1.5 text-gray-400 hover:text-brand hover:bg-pink-50 rounded-xl transition-colors">
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
