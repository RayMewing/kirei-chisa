import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';
import ServerStatus from '@/components/ServerStatus';
import Link from 'next/link';
import { ShoppingBag, Phone, Zap, Shield, Clock, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* Background Ornaments / Glow Effects - Soft Red & White */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-rose-100/60 to-transparent -z-10" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-300/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-64 -left-32 w-80 h-80 bg-rose-300/10 rounded-full blur-[100px] -z-10" />

      <Navbar />
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 relative z-10">
            <div>
              <h2 className="text-sm font-bold text-rose-600 tracking-widest uppercase mb-1 flex items-center gap-2">
                <Zap size={16} className="text-rose-500" /> Platform Terpercaya
              </h2>
            </div>
            <ServerStatus />
          </div>

          {/* Video Container 16:9 */}
          <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-900/10 mb-10 group border border-white/80">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://litter.catbox.moe/2blbf01u1qz6k687.mp4" 
            />
            
            {/* Overlay Gradient & Teks - Soft dark rose overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-rose-900/30 to-white/10 flex flex-col items-center justify-center text-center p-6 sm:p-10 backdrop-blur-[1px]">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-rose-200 drop-shadow-md">
                  Kirei Chisa
                </span>
              </h1>
              <p className="text-rose-50 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6 drop-shadow-md">
                Platform jual beli akun premium, OTP virtual, dan Top-Up PPOB terlengkap. 
                Transaksi cepat, aman, dan otomatis 24/7.
              </p>
              
              <Link href="#layanan" className="px-8 py-3 bg-white/20 hover:bg-white/30 border border-white/50 text-white rounded-full font-semibold backdrop-blur-md transition-all duration-300 flex items-center gap-2 hover:gap-3 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                Jelajahi Layanan <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <BannerSlider />
        </section>

        {/* Services */}
        <section id="layanan" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Layanan Unggulan</h2>
            <p className="text-gray-500 mt-2">Pilih layanan yang kamu butuhkan hari ini</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Premku Card */}
            <Link href="/premku" className="group bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-rose-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">Premku</h3>
                    <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-rose-100">Tersedia</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Akun premium Netflix, Spotify, Canva, dll. Harga pelajar, stok selalu ready.
                  </p>
                </div>
              </div>
            </Link>

            {/* Nokos Card */}
            <Link href="/nokos" className="group bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-rose-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                  <Phone size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">Nokos OTP</h3>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-red-100">Realtime</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Nomor virtual luar negeri untuk verifikasi OTP WA, Tele, FB, dan lainnya.
                  </p>
                </div>
              </div>
            </Link>

            {/* PPOB Card */}
            <Link href="/ppob" className="group bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-rose-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 flex-shrink-0">
                  <Zap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">PPOB</h3>
                    <span className="bg-pink-50 text-pink-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-pink-100">Top Up</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Top up Game (FF, MLBB), E-Wallet (DANA, OVO), dan pulsa semua operator.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-rose-900/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Kenapa Memilih Kami?</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: Zap, label: 'Instan 24/7', desc: 'Proses otomatis', color: 'from-rose-400 to-red-400', shadow: 'shadow-red-500/10' },
                { icon: Shield, label: 'Terjamin Aman', desc: 'Sistem enkripsi', color: 'from-red-400 to-rose-500', shadow: 'shadow-rose-500/10' },
                { icon: Clock, label: 'Stok Realtime', desc: 'Selalu update', color: 'from-pink-400 to-rose-400', shadow: 'shadow-pink-500/10' },
                { icon: Star, label: 'Harga Miring', desc: 'Super kompetitif', color: 'from-rose-300 to-red-400', shadow: 'shadow-red-500/10' },
              ].map(({ icon: Icon, label, desc, color, shadow }) => (
                <div key={label} className="flex flex-col items-center text-center group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} ${shadow} shadow-lg flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
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
