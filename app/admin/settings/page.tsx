'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Settings, TerminalSquare, Crosshair, Link as LinkIcon, Database } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Socials { telegram: string; tiktok: string; whatsapp: string; whatsapp_channel: string; }
interface FAQ { question: string; answer: string; }

export default function AdminSettingsPage() {
  const [socials, setSocials] = useState<Socials>({ telegram: '', tiktok: '', whatsapp: '', whatsapp_channel: '' });
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [logo, setLogo] = useState('');
  const [qrisFee, setQrisFee] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.success) {
        if (d.settings.socials) setSocials(d.settings.socials as Socials);
        if (d.settings.faqs) setFaqs(d.settings.faqs as FAQ[]);
        if (d.settings.logo) setLogo(d.settings.logo as string);
        if (d.settings.qris_fee_percent !== undefined) setQrisFee(String(d.settings.qris_fee_percent));
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async (key: string, value: unknown, label: string) => {
    setSaving(key);
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    const d = await res.json();
    if (d.success) toast.success(`[${label.toUpperCase()}] Konfigurasi Diperbarui.`); else toast.error(`Kesalahan Sistem: ${d.message}`);
    setSaving(null);
  };

  const addFaq = () => setFaqs(p => [...p, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(p => p.filter((_, x) => x !== i));
  const updateFaq = (i: number, f: 'question' | 'answer', v: string) =>
    setFaqs(p => p.map((item, x) => x === i ? { ...item, [f]: v } : item));

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32">
      <Crosshair size={40} className="text-red-600 animate-[spin_4s_linear_infinite] mb-4" />
      <p className="font-mono text-xs text-red-500 uppercase tracking-widest animate-pulse">Memuat Data Konfigurasi...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Settings className="text-red-500" size={28} />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Pengaturan Sistem
          </h1>
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-10">
          {'>>'} Modul Konfigurasi Inti
        </p>
      </div>

      {/* Box 1: Web Logo */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-sm font-black font-mono text-white uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
            <TerminalSquare size={16} className="text-red-500" /> Grafik Identitas Web
          </h2>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <ImageUpload value={logo} onChange={setLogo} label="Unggah Aset Gambar (Tampilan Navbar)" aspectRatio="1/1" maxSizeMB={1} />
          </div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{'>>'} Spesifikasi: Rasio 1:1, PNG Transparan, Maks 1MB</p>
          <button onClick={() => save('logo', logo, 'Logo')} disabled={saving === 'logo'} className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2">
            {saving === 'logo' ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>

      {/* Box 2: QRIS Fee */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-600"></div>
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-sm font-black font-mono text-white uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Database size={16} className="text-amber-500" /> Biaya Jaringan QRIS
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{'>>'} Persentase tambahan dinamis pada saat pengguna deposit. Contoh: 2% -{'>'} 100rb menjadi 102rb.</p>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input type="number" min="0" max="10" step="0.1" className="bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] text-white font-mono font-black text-lg px-4 py-2 outline-none transition-all w-32" value={qrisFee} onChange={e => setQrisFee(e.target.value)} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono font-bold">%</span>
            </div>
            <button onClick={() => save('qris_fee_percent', parseFloat(qrisFee) || 0, 'Fee QRIS')} disabled={saving === 'qris_fee_percent'} className="py-2.5 px-6 bg-amber-950/50 hover:bg-amber-900/50 text-amber-500 font-mono font-bold uppercase tracking-widest border border-amber-900/50 transition-all flex items-center justify-center gap-2">
              {saving === 'qris_fee_percent' ? <span className="spinner border-amber-500/30 border-t-amber-500" /> : <><Save size={14} /> Terapkan Parameter</>}
            </button>
          </div>
        </div>
      </div>

      {/* Box 3: Social Links */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-600"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
        
        <div className="relative z-10 space-y-5">
          <h2 className="text-sm font-black font-mono text-white uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
            <LinkIcon size={16} className="text-blue-500" /> Saluran Komunikasi
          </h2>
          <div className="space-y-4">
            {([['telegram','Node Telegram','https://t.me/...'],['tiktok','Feed TikTok','https://tiktok.com/@...'],['whatsapp','WhatsApp Langsung','https://wa.me/628...'],['whatsapp_channel','Siaran WhatsApp','https://whatsapp.com/channel/...']] as [keyof Socials, string, string][]).map(([k, l, p]) => (
              <div key={k}>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} {l}</label>
                <input className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 text-white font-mono text-xs px-4 py-2.5 outline-none transition-all placeholder-zinc-700" placeholder={p} value={socials[k]} onChange={e => setSocials(s => ({ ...s, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button onClick={() => save('socials', socials, 'Comm Links')} disabled={saving === 'socials'} className="py-3 px-6 bg-blue-950/30 hover:bg-blue-900/50 text-blue-400 font-mono font-bold uppercase tracking-widest border border-blue-900/50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
            {saving === 'socials' ? <span className="spinner border-blue-500/30 border-t-blue-500" /> : <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>

      {/* Box 4: FAQs */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-600"></div>
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-black font-mono text-white uppercase tracking-widest flex items-center gap-2">
              <TerminalSquare size={16} className="text-emerald-500" /> Basis Data FAQ
            </h2>
            <button onClick={addFaq} className="px-3 py-1.5 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-500 font-mono text-[10px] uppercase tracking-widest border border-emerald-900/50 transition-all flex items-center gap-1.5">
              <Plus size={12} /> Tambah Pertanyaan
            </button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-[10px] font-mono text-zinc-500 text-center py-6 border border-dashed border-zinc-800 uppercase tracking-widest">{'>>'} TIDAK ADA DATA</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-zinc-800 bg-zinc-950 p-4 space-y-3 relative group">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-1.5">Pertanyaan</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white font-mono text-xs px-3 py-2 outline-none transition-all placeholder-zinc-700" placeholder="Masukkan pertanyaan..." value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-1.5">Respons</label>
                        <textarea className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white font-mono text-xs px-3 py-2 outline-none transition-all resize-none placeholder-zinc-700" rows={3} placeholder="Masukkan respons..." value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => removeFaq(i)} className="sm:mt-5 p-2 h-fit bg-red-950/20 text-red-500 hover:bg-red-900/50 border border-red-900/30 transition-colors flex-shrink-0 flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={() => save('faqs', faqs, 'FAQ')} disabled={saving === 'faqs'} className="py-3 px-6 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 font-mono font-bold uppercase tracking-widest border border-emerald-900/50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto mt-4">
            {saving === 'faqs' ? <span className="spinner border-emerald-500/30 border-t-emerald-500" /> : <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>
  );
}
