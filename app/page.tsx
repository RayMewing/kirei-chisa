import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';
import ServerStatus from '@/components/ServerStatus';
import Link from 'next/link';
import { ShoppingBag, Phone, Zap, Shield, Clock, Star, ArrowRight, Crosshair } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden selection:bg-red-600 selection:text-white font-sans">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-80 pointer-events-none -z-10" />

      {/* Glowing Neon Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <h2 className="text-xs font-mono font-bold text-red-500 tracking-[0.2em] uppercase">
                Sys.Online // Kirei_Chisa
              </h2>
            </div>
            <ServerStatus />
          </div>

          {/* Video Container 16:9 - Mecha / Cyberpunk Style */}
          <div className="relative w-full aspect-video overflow-hidden mb-10 group border-l-4 border-red-600 bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
            {/* Tech Corners */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/50 z-20"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/50 z-20"></div>

            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
              src="/assets/kirei.mp4" 
            />
            
            {/* Overlay Scanlines & Tech Gradient */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/70 to-transparent z-10 flex flex-col justify-center p-6 sm:p-12">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-2 uppercase tracking-tighter" style={{ textShadow: '3px 3px 0px #dc2626' }}>
                Welcome to <br />
                <span className="text-red-500">Kirei Chisa</span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base max-w-lg font-mono mb-8 border-l-2 border-red-600 pl-4 bg-zinc-950/30 p-2 backdrop-blur-sm">
                [DATA_LINK_ESTABLISHED] <br/><br/>
                Platform jual beli akun premium, OTP virtual, dan Top-Up PPOB terlengkap. 
                Transaksi cepat, aman, 24/7.
              </p>
              
              <Link href="#layanan" className="w-fit px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-mono tracking-widest uppercase transition-all duration-200 border border-red-400 hover:border-white shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center gap-3 group">
                Initialize <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <BannerSlider />
        </section>

        {/* Services */}
        <section id="layanan" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10 border-b-2 border-zinc-800 pb-4 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Database Layanan</h2>
              <p className="text-red-500 font-mono text-xs mt-1">{'>>'} Select your module_</p>
            </div>
            <Crosshair className="text-red-600/50 animate-[spin_4s_linear_infinite]" size={32} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Premku Card */}
            <Link href="/premku" className="group bg-zinc-900/50 border border-zinc-800 hover:border-red-600 p-6 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 blur-xl group-hover:bg-red-600/30 transition-colors" />
              <div className="absolute -bottom-px left-0 w-0 h-1 bg-red-600 group-hover:w-full transition-all duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-700 group-hover:border-red-500 flex items-center justify-center flex-shrink-0 transition-colors">
                  <ShoppingBag size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg uppercase tracking-wide">Premku</h3>
                    <span className="bg-red-600/10 text-red-500 border border-red-600/30 text-[10px] font-mono px-2 py-0.5 uppercase">Active</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-mono text-xs">
                    Akun premium Netflix, Spotify, Canva. Harga pelajar, stok auto-sync.
                  </p>
                </div>
              </div>
            </Link>

            {/* Nokos Card */}
            <Link href="/nokos" className="group bg-zinc-900/50 border border-zinc-800 hover:border-white p-6 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />
              <div className="absolute -bottom-px left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-700 group-hover:border-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Phone size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg uppercase tracking-wide">Nokos OTP</h3>
                    <span className="bg-white/5 text-white border border-white/30 text-[10px] font-mono px-2 py-0.5 uppercase">Realtime</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-mono text-xs">
                    Nomor virtual luar negeri untuk verifikasi OTP WA, Tele, FB, dll.
                  </p>
                </div>
              </div>
            </Link>

            {/* PPOB Card */}
            <Link href="/ppob" className="group bg-zinc-900/50 border border-zinc-800 hover:border-red-600 p-6 relative overflow-hidden transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 blur-xl group-hover:bg-red-600/30 transition-colors" />
              <div className="absolute -bottom-px left-0 w-0 h-1 bg-red-600 group-hover:w-full transition-all duration-300" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-700 group-hover:border-red-500 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Zap size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg uppercase tracking-wide">PPOB</h3>
                    <span className="bg-red-600/10 text-red-500 border border-red-600/30 text-[10px] font-mono px-2 py-0.5 uppercase">Top Up</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-mono text-xs">
                    Top up Game (FF, MLBB), E-Wallet (DANA, OVO), dan pulsa all operator.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-zinc-900/80 border border-zinc-800 p-8 sm:p-10 relative">
            {/* Tech Corners Component */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600"></div>
            
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">System Specs</h2>
              <div className="w-16 h-1 bg-red-600 mx-auto mt-4 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { icon: Zap, label: 'Instan 24/7', desc: 'Auto_Execution' },
                { icon: Shield, label: 'Secure', desc: 'Encrypted_Data' },
                { icon: Clock, label: 'Realtime', desc: 'Live_Sync' },
                { icon: Star, label: 'Best Price', desc: 'Low_Cost' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center group">
                  <div className={`w-16 h-16 bg-zinc-950 border border-zinc-700 group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center mb-4 transition-all duration-300 transform group-hover:-translate-y-2`}>
                    <Icon size={24} className="text-white group-hover:text-red-500 transition-colors" />
                  </div>
                  <p className="font-bold text-white text-sm uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-xs text-red-500 font-mono tracking-wider">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
