'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

interface Socials { telegram: string; tiktok: string; whatsapp: string; whatsapp_channel: string; }
interface FAQ { question: string; answer: string; }

export default function AdminSettingsPage() {
  const [socials, setSocials] = useState<Socials>({ telegram: '', tiktok: '', whatsapp: '', whatsapp_channel: '' });
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSocials, setSavingSocials] = useState(false);
  const [savingFaqs, setSavingFaqs] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.success) {
        if (d.settings.socials) setSocials(d.settings.socials as Socials);
        if (d.settings.faqs) setFaqs(d.settings.faqs as FAQ[]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveSocials = async () => {
    setSavingSocials(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'socials', value: socials }),
    });
    const d = await res.json();
    if (d.success) toast.success('Link sosmed tersimpan!'); else toast.error(d.message);
    setSavingSocials(false);
  };

  const saveFaqs = async () => {
    setSavingFaqs(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'faqs', value: faqs }),
    });
    const d = await res.json();
    if (d.success) toast.success('FAQ tersimpan!'); else toast.error(d.message);
    setSavingFaqs(false);
  };

  const addFaq = () => setFaqs(prev => [...prev, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(prev => prev.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: 'question' | 'answer', val: string) =>
    setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  if (loading) return <div className="flex justify-center pt-10"><div className="spinner spinner-brand scale-150" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-bold text-gray-900">Pengaturan</h1>

      {/* Social Media */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-900">Link Media Sosial</h2>
        {[
          { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username' },
          { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
          { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/628xxx' },
          { key: 'whatsapp_channel', label: 'Saluran WhatsApp', placeholder: 'https://whatsapp.com/channel/...' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" placeholder={placeholder} value={socials[key as keyof Socials]}
              onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))} />
          </div>
        ))}
        <button onClick={saveSocials} disabled={savingSocials} className="btn-primary py-2.5 text-sm">
          {savingSocials ? <span className="spinner" /> : <><Save size={14} />Simpan Link Sosmed</>}
        </button>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">FAQ</h2>
          <button onClick={addFaq} className="btn-secondary py-1.5 px-3 text-sm">
            <Plus size={14} />Tambah FAQ
          </button>
        </div>
        {faqs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Belum ada FAQ. Klik tambah FAQ.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 mt-2.5 w-4 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <input className="input text-sm" placeholder="Pertanyaan" value={faq.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)} />
                    <textarea className="input text-sm resize-none" rows={2} placeholder="Jawaban" value={faq.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)} />
                  </div>
                  <button onClick={() => removeFaq(i)} className="mt-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={saveFaqs} disabled={savingFaqs} className="btn-primary py-2.5 text-sm">
          {savingFaqs ? <span className="spinner" /> : <><Save size={14} />Simpan FAQ</>}
        </button>
      </div>
    </div>
  );
}
