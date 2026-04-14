'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Music2, MessageCircle, Radio, TerminalSquare, Crosshair, Zap } from 'lucide-react';

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
    <footer className="bg-zinc-950 border-t-2 border-red-900/50 mt-16 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-red-600/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-10" />

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TerminalSquare className="text-red-500" size={24} />
            <h2 className="text-2xl font-black text-center text-white uppercase tracking-widest">Sys.FAQ</h2>
          </div>
          <p className="text-center text-zinc-500 text-xs font-mono mb-8 uppercase tracking-widest">{'>>'} Frequently Asked Queries</p>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-zinc-800 bg-zinc-900/50 rounded-none overflow-hidden relative group">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-zinc-800/80 transition-colors relative z-10"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold font-mono text-zinc-300 text-sm uppercase tracking-wide">{faq.question}</span>
                  <span className={`text-red-500 font-mono text-lg transition-transform ${openFaq === i ? 'rotate-45 text-white' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 py-4 text-sm text-zinc-400 bg-zinc-950 border-t border-zinc-800 leading-relaxed font-mono relative z-10 flex gap-3">
                    <span className="text-red-500 font-bold">{'>>'}</span>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Footer Info */}
      <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand / Admin Profile */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Image Container dengan border Cyberpunk */}
                <div className="w-14 h-14 relative border-2 border-red-600 p-0.5 group shrink-0">
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-red-500"></div>
                  {/* Pake img biasa biar aman dari strict config next/image URL external */}
                  <img 
                    src="https://whqlpszmydukjwyyexnf.supabase.co/storage/v1/object/public/media-hosting/ray-1776143746380.jpg" 
                    alt="Admin Kirei Chisa" 
                    className="w-full h-full object-cover grayscale-[70%] group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div>
                  <span className="font-black text-white text-xl uppercase tracking-widest block" style={{ textShadow: '2px 2px 0px #dc2626' }}>
                    Kirei Chisa
                  </span>
                  <span className="font-bold font-mono text-red-500 text-[10px] tracking-[0.2em] uppercase">
                    System Administrator
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono border-l-2 border-red-900 pl-3">
                Platform jual beli akun premium dan OTP nomor virtual terpercaya. 
                Transaksi cepat, aman, dan auto-execute 24/7.
              </p>
            </div>

            {/* Nav Links */}
            <div>
              <h4 className="font-black text-white mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={16} className="text-red-500" /> Database_Links
              </h4>
              <ul className="space-y-3 font-mono text-xs">
                {[
                  { href: '/premku', label: 'Premku (Premium)' },
                  { href: '/nokos', label: 'Nokos OTP (Virtual)' },
                  { href: '/deposit', label: 'Deposit (Top-Up)' },
                  { href: '/history', label: 'History (History)' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-zinc-500 hover:text-red-400 flex items-center gap-2 transition-colors group">
                      <span className="text-zinc-700 group-hover:text-red-500 transition-colors">{'>>'}</span> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social / Comm Links */}
            <div>
              <h4 className="font-black text-white mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <Radio size={16} className="text-red-500" /> Channels
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: socials.telegram, icon: Send, label: 'Telegram_Node' },
                  { href: socials.tiktok, icon: Music2, label: 'TikTok_Feed' },
                  { href: socials.whatsapp, icon: MessageCircle, label: 'WhatsApp_Direct' },
                  { href: socials.whatsapp_channel, icon: Radio, label: 'WhatsApp_Broadcast' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/20 text-xs font-mono uppercase tracking-widest transition-all group w-fit"
                  >
                    <Icon size={14} className="group-hover:animate-pulse" /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              © 2026 KIREI_CHISA ALL RIGHTS RESERVED
            </p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              Constructed with <Zap size={12} className="text-red-500" /> for optimal execution
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
