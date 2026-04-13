'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
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
    if (d.success) toast.success(label + ' tersimpan!'); else toast.error(d.message);
    setSaving(null);
  };

  const addFaq = () => setFaqs(p => [...p, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(p => p.filter((_, x) => x !== i));
  const updateFaq = (i: number, f: 'question' | 'answer', v: string) =>
    setFaqs(p => p.map((item, x) => x === i ? { ...item, [f]: v } : item));

  if (loading) return <div className="flex justify-center pt-16"><div className="spinner spinner-brand scale-150" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-black text-gray-900">Pengaturan ⚙️</h1>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
        <h2 className="font-black text-gray-900">Logo Website</h2>
        <ImageUpload value={logo} onChange={setLogo} label="Upload Logo (tampil di navbar)" aspectRatio="1/1" maxSizeMB={1} />
        <p className="text-xs text-gray-400">Rekomendasi: ukuran kotak 1:1, PNG transparan, maks 1MB</p>
        <button onClick={() => save('logo', logo, 'Logo')} disabled={saving === 'logo'} className="btn-primary py-2.5 text-sm">
          {saving === 'logo' ? <span className="spinner" /> : <><Save size={14} />Simpan Logo</>}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-3">
        <h2 className="font-black text-gray-900">Biaya Admin QRIS</h2>
        <p className="text-xs text-gray-400">Fee % ditambahkan ke nominal deposit user. Contoh: 2% → Rp100.000 jadi Rp102.000</p>
        <div className="flex gap-2 items-center">
          <input type="number" min="0" max="10" step="0.1" className="input w-32" value={qrisFee} onChange={e => setQrisFee(e.target.value)} />
          <span className="text-sm text-gray-500 font-bold">%</span>
        </div>
        <button onClick={() => save('qris_fee_percent', parseFloat(qrisFee) || 0, 'Fee QRIS')} disabled={saving === 'qris_fee_percent'} className="btn-primary py-2.5 text-sm">
          {saving === 'qris_fee_percent' ? <span className="spinner" /> : <><Save size={14} />Simpan Fee</>}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
        <h2 className="font-black text-gray-900">Link Media Sosial</h2>
        {([['telegram','✈️ Telegram','https://t.me/...'],['tiktok','🎵 TikTok','https://tiktok.com/@...'],['whatsapp','💬 WhatsApp','https://wa.me/628...'],['whatsapp_channel','📢 Saluran WA','https://whatsapp.com/channel/...']] as [keyof Socials, string, string][]).map(([k, l, p]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input className="input" placeholder={p} value={socials[k]} onChange={e => setSocials(s => ({ ...s, [k]: e.target.value }))} />
          </div>
        ))}
        <button onClick={() => save('socials', socials, 'Link sosmed')} disabled={saving === 'socials'} className="btn-primary py-2.5 text-sm">
          {saving === 'socials' ? <span className="spinner" /> : <><Save size={14} />Simpan Sosmed</>}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-gray-900">FAQ</h2>
          <button onClick={addFaq} className="btn-secondary py-1.5 px-3 text-sm"><Plus size={14} />Tambah</button>
        </div>
        {faqs.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Belum ada FAQ.</p> : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-pink-50 rounded-2xl p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <input className="input text-sm" placeholder="Pertanyaan" value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
                    <textarea className="input text-sm resize-none" rows={2} placeholder="Jawaban" value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} />
                  </div>
                  <button onClick={() => removeFaq(i)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => save('faqs', faqs, 'FAQ')} disabled={saving === 'faqs'} className="btn-primary py-2.5 text-sm">
          {saving === 'faqs' ? <span className="spinner" /> : <><Save size={14} />Simpan FAQ</>}
        </button>
      </div>
    </div>
  );
}
