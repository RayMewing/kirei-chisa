import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';
import ServerStatus from '@/components/ServerStatus';
import Link from 'next/link';
import { ShoppingBag, Phone, Zap, Shield, Clock, Star, ArrowRight, Crosshair, MonitorPlay } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden selection:bg-red-600 selection:text-white font-sans">
      {/* Glowing Neon Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 pb-16">
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* System Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 relative z-10 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <h2 className="text-xs font-mono font-bold text-red-500 tracking-[0.2em] uppercase">
                Sys.Online // Kirei_Chisa // V1.0.2
              </h2>
            </div>
            <ServerStatus />
          </div>

          {/* MAIN Hero Container - Fixed height for Mobile */}
          <div className="relative w-full min-h-[480px] sm:min-h-[500px] py-12 flex flex-col justify-center overflow-hidden mb-12 border-l-4 border-red-600 bg-zinc-900 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
            {/* Tech Corners */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/40 z-30 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/40 z-30 pointer-events-none"></div>

            {/* Background Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity z-0"
              src="/assets/dummy-video.mp4" 
            />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/70 to-zinc-950/80 z-10" />
            
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-10 max-w-3xl mx-auto">
              
              {/* VIDEO INSIDE TEXT TRICK */}
              <div className="relative w-full flex flex-col items-center justify-center mb-6 border-b border-dashed border-red-900/50 pb-6">
                
                {/* Video text mask element */}
                <div className="relative overflow-hidden w-full h-24 sm:h-32 md:h-40 flex items-center justify-center">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    src="https://whqlpszmydukjwyyexnf.supabase.co/storage/v1/object/public/media-hosting/ray-1776107268834.mp4" 
                  />
                  <div className="absolute inset-0 bg-red-950/40" />
                  
                  {/* Text that acts as a mask (mix-blend-multiply on white BG is standard, but mix-blend-difference works cool on dark) */}
                  <h1 className="relative z-10 font-black text-white uppercase tracking-tighter leading-none mix-blend-difference text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] drop-shadow-[2px_2px_0px_rgba(220,38,38,0.8)] whitespace-nowrap">
                    WELCOME TO
                  </h1>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-red-500 uppercase tracking-widest mt-2" style={{ textShadow: '2px 2px 0px #450a0a' }}>
                  Kirei Chisa
                </h2>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm font-mono mb-8 border-l-2 border-red-600 pl-4 bg-zinc-950/60 p-4 backdrop-blur-md shadow-lg text-left max-w-lg w-full">
                <span className="text-red-500 font-bold">[{'>'} DATA_LINK_ESTABLISHED]</span> <br/><br/>
                Platform jual beli akun premium, OTP virtual, dan Top-Up PPOB terlengkap. 
                Transaksi cepat, aman, 24/7 otomatis.
              </p>
              
              <Link href="#layanan" className="btn-primary group">
                <MonitorPlay size={18} /> Initialize <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-30 pointer-events-none opacity-50" />
          </div>

          <BannerSlider />
        </section>

        {/* ... (Bagian Layanan & Features di bawahnya persis sama kayak kode sebelumnya) ... */}
        {/* Services */}
        <section id="layanan" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10 border-b-2 border-zinc-800 pb-4 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Database Layanan</h2>
              <p className="text-red-500 font-mono text-xs mt-1">{'>'}{'>'} Select your module_</p>
            </div>
            <Crosshair className="text-red-600/50 animate-[spin_6s_linear_infinite]" size={32} />
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
