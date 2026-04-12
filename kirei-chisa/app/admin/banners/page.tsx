'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Banner { _id: string; title: string; imageUrl: string; linkUrl: string; isActive: boolean; order: number; }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', order: 0 });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/admin/banners').then(r => r.json()).then(d => {
      if (d.success) setBanners(d.banners);
    }).finally(() => setLoading(false));
  }, []);

  const addBanner = async () => {
    if (!form.title || !form.imageUrl) { toast.error('Title dan URL gambar wajib diisi.'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Banner ditambahkan!');
        setBanners(prev => [d.banner, ...prev]);
        setForm({ title: '', imageUrl: '', linkUrl: '', order: 0 });
        setShowForm(false);
      } else toast.error(d.message);
    } finally { setAdding(false); }
  };

  const toggleActive = async (banner: Banner) => {
    const res = await fetch('/api/admin/banners', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: banner._id, isActive: !banner.isActive }),
    });
    const d = await res.json();
    if (d.success) {
      setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, isActive: !b.isActive } : b));
      toast.success(banner.isActive ? 'Banner dinonaktifkan.' : 'Banner diaktifkan.');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    const res = await fetch('/api/admin/banners', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const d = await res.json();
    if (d.success) { toast.success('Banner dihapus.'); setBanners(prev => prev.filter(b => b._id !== id)); }
    else toast.error(d.message);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Banner Promosi</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} />{showForm ? 'Tutup' : 'Tambah Banner'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">Banner Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Judul Banner</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Promo Hari Ini!" /></div>
            <div><label className="label">URL Gambar (16:9)</label><input className="input" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><label className="label">Link Tujuan (opsional)</label><input className="input" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><label className="label">Urutan</label><input type="number" className="input" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          {form.imageUrl && (
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ paddingBottom: '30%' }}>
              <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="600px"
                onError={() => toast.error('URL gambar tidak valid.')} />
            </div>
          )}
          <button onClick={addBanner} disabled={adding} className="btn-primary py-2.5">
            {adding ? <span className="spinner" /> : 'Simpan Banner'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
          Belum ada banner. Tambahkan banner baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map(b => (
            <div key={b._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${b.isActive ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
              <div className="relative w-full bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="400px" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{b.linkUrl}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Urutan: {b.order}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(b)} className="p-1.5 text-gray-400 hover:text-brand transition-colors" title={b.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                    {b.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteBanner(b._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
