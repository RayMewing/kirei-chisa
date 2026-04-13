'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Banner { _id: string; title: string; imageUrl: string; linkUrl: string; isActive: boolean; order: number; }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', order: '0' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/admin/banners').then(r => r.json()).then(d => { if (d.success) setBanners(d.banners); }).finally(() => setLoading(false));
  }, []);

  const addBanner = async () => {
    if (!form.title || !form.imageUrl) { toast.error('Judul dan gambar wajib.'); return; }
    setAdding(true);
    const res = await fetch('/api/admin/banners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl || '#', order: parseInt(form.order) || 0 }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Banner ditambahkan! ✨');
      setBanners(p => [d.banner, ...p]);
      setForm({ title: '', imageUrl: '', linkUrl: '', order: '0' });
      setShowForm(false);
    } else toast.error(d.message);
    setAdding(false);
  };

  const toggleActive = async (banner: Banner) => {
    const res = await fetch('/api/admin/banners', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: banner._id, isActive: !banner.isActive }) });
    const d = await res.json();
    if (d.success) setBanners(p => p.map(b => b._id === banner._id ? { ...b, isActive: !b.isActive } : b));
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    const res = await fetch('/api/admin/banners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const d = await res.json();
    if (d.success) { toast.success('Banner dihapus.'); setBanners(p => p.filter(b => b._id !== id)); }
    else toast.error(d.message);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-gray-900">Banner Promosi 🖼️</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} />{showForm ? 'Tutup' : 'Tambah Banner'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-5 border-2 border-brand/20 space-y-4">
          <h2 className="font-black text-gray-900">Banner Baru</h2>
          <ImageUpload value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} label="Gambar Banner (16:9)" aspectRatio="16/9" maxSizeMB={2} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Judul</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Promo Hari Ini!" />
            </div>
            <div>
              <label className="label">Urutan</label>
              <input type="number" className="input" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Link Tujuan (opsional)</label>
              <input className="input" value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <button onClick={addBanner} disabled={adding} className="btn-primary py-2.5">
            {adding ? <span className="spinner" /> : <><Plus size={14} />Simpan Banner</>}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="h-44 rounded-3xl bg-pink-50 animate-pulse" />)}</div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center text-gray-400 border border-pink-100">Belum ada banner.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map(b => (
            <div key={b._id} className={`bg-white rounded-3xl overflow-hidden border-2 ${b.isActive ? 'border-pink-100' : 'border-gray-100 opacity-60'}`}>
              <div className="relative w-full bg-pink-50" style={{ paddingBottom: '56.25%' }}>
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="400px" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black text-gray-900 text-sm truncate">{b.title}</p>
                  <p className="text-xs text-gray-400">Urutan: {b.order}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(b)}>
                    {b.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-300" />}
                  </button>
                  <button onClick={() => deleteBanner(b._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
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
