'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Music2, MessageCircle, Radio } from 'lucide-react';

interface SocialLinks {
  telegram: string;
  tiktok: string;
  whatsapp: string;
  whatsapp_channel: string;
}

interface FAQ { question: string; answer: string; }

export default function Footer() {
  const [socials, setSocials] = useState<SocialLinks>({
    telegram: '#', tiktok: '#', whatsapp: '#', whatsapp_channel: '#',
  });
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then(d => {
      if (d.success) {
        if (d.socials) setSocials(d.socials);
        if (d.faqs) setFaqs(d.faqs);
      }
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">FAQ</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Pertanyaan yang sering ditanyakan</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-800 text-sm">{faq.question}</span>
                  <span className={`text-brand text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 bg-gray-50 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KC</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">Kirei</span>
                  <span className="font-bold text-brand"> Chisa</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Platform jual beli akun premium dan OTP nomor virtual terpercaya. Transaksi cepat, aman, dan 24 jam.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Layanan</h4>
              <ul className="space-y-2">
                {[
                  { href: '/premku', label: 'Premku — Akun Premium' },
                  { href: '/nokos', label: 'Nokos — OTP Virtual' },
                  { href: '/deposit', label: 'Deposit Saldo' },
                  { href: '/history', label: 'Riwayat Pesanan' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-brand transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Hubungi Kami</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { href: socials.telegram, icon: Send, label: 'Telegram', color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200' },
                  { href: socials.tiktok, icon: Music2, label: 'TikTok', color: 'hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300' },
                  { href: socials.whatsapp, icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200' },
                  { href: socials.whatsapp_channel, icon: Radio, label: 'WA Channel', color: 'hover:bg-green-50 hover:text-green-700 hover:border-green-200' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <a
                    key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium transition-all ${color}`}
                  >
                    <Icon size={14} /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 Kirei Chisa. All rights reserved.</p>
            <p className="text-xs text-gray-400">Dibuat dengan ❤️ untuk kemudahan transaksi digital</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
