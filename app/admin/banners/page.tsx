'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X, Image as ImageIcon, TerminalSquare, Power, MonitorPlay } from 'lucide-react';
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
    if (!form.title || !form.imageUrl) { toast.error('Title and Visual Asset required.'); return; }
    setAdding(true);
    const res = await fetch('/api/admin/banners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl || '#', order: parseInt(form.order) || 0 }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Visual Asset Deployed! ✨');
      setBanners(p => [d.banner, ...p]);
      setForm({ title: '', imageUrl: '', linkUrl: '', order: '0' });
      setShowForm(false);
    } else toast.error(`Sys_Error: ${d.message}`);
    setAdding(false);
  };

  const toggleActive = async (banner: Banner) => {
    const res = await fetch('/api/admin/banners', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: banner._id, isActive: !banner.isActive }) });
    const d = await res.json();
    if (d.success) {
      setBanners(p => p.map(b => b._id === banner._id ? { ...b, isActive: !b.isActive } : b));
      toast.success(`Node status: ${!banner.isActive ? 'ONLINE' : 'OFFLINE'}`);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Purge this asset from database?')) return;
    const res = await fetch('/api/admin/banners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const d = await res.json();
    if (d.success) { toast.success('Asset purged.'); setBanners(p => p.filter(b => b._id !== id)); }
    else toast.error(`Sys_Error: ${d.message}`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-red-500" size={28} />
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Banners_Cfg
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{'>>'} Visual Assets Management</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-3 text-xs w-full sm:w-auto">
          {showForm ? <><X size={14} /> Cancel_Deploy</> : <><Plus size={14} /> Deploy_New_Asset</>}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-zinc-900/80 backdrop-blur-md p-6 border border-red-500/50 relative shadow-[0_0_20px_rgba(220,38,38,0.1)]">
          {/* Tech Corners */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
          
          <h2 className="font-black font-mono text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
            <TerminalSquare size={16} className="text-red-500" /> Construct_Banner_Node
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="sm:col-span-3 bg-zinc-950 border border-zinc-800 p-4">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">{'>>'} Visual_Asset (16:9)</p>
              <ImageUpload value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} label="" aspectRatio="16/9" maxSizeMB={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Banner_Title</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder-zinc-700" 
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Flash Sale Protocol!" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Seq_Order</label>
              <input type="number" className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder-zinc-700" 
                value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Target_URI (Optional)</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder-zinc-700" 
                value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <button onClick={addBanner} disabled={adding} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 transition-all flex items-center justify-center gap-2">
            {adding ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={14} /> Execute_Save</>}
          </button>
        </div>
      )}

      {/* Lists */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => <div key={i} className="h-56 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-16 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
          <MonitorPlay size={40} className="mx-auto mb-4 text-zinc-700 animate-pulse" />
          <p className="font-mono text-zinc-500 uppercase tracking-widest text-sm">{'>>'} NO_ASSETS_FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {banners.map(b => (
            <div key={b._id} className={`bg-zinc-900 border transition-all relative group overflow-hidden ${b.isActive ? 'border-zinc-700 hover:border-red-500/50' : 'border-zinc-800 opacity-60'}`}>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10" />
              
              {/* Image Box */}
              <div className="relative w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <Image src={b.imageUrl} alt={b.title} fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 relative z-0" sizes="400px" />
                <div className="absolute inset-0 bg-red-900/10 mix-blend-color z-0 group-hover:opacity-0 transition-opacity" />
              </div>
              
              {/* Info Box */}
              <div className="p-4 flex items-center justify-between gap-3 relative z-20">
                <div className="min-w-0 flex-1">
                  <p className="font-black font-mono text-white text-sm uppercase tracking-wide truncate">{b.title}</p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 tracking-widest uppercase">SEQ_ORDER: {b.order}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(b)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all border ${b.isActive ? 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50 hover:bg-emerald-900/50' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}>
                    {b.isActive ? <><Power size={10} /> Online</> : <><Power size={10} /> Offline</>}
                  </button>
                  <button onClick={() => deleteBanner(b._id)} className="p-2 bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 hover:text-white transition-all">
                    <Trash2 size={14} />
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
