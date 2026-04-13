import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';
import ServerStatus from '@/components/ServerStatus';
import Link from 'next/link';
import { ShoppingBag, Phone, Zap, Shield, Clock, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Ornaments / Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent -z-10" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-64 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <Navbar />
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 relative z-10">
            <div>
              <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-1 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" /> Platform Terpercaya
              </h2>
            </div>
            <ServerStatus />
          </div>

          {/* Video Container 16:9 */}
          <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 mb-10 group border border-white/50">
            {/* Ganti src ini dengan path video kamu, misal: /assets/video-banner.mp4 */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/assets/dummy-video.mp4" 
            />
            
            {/* Overlay Gradient & Teks */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-black/30 flex flex-col items-center justify-center text-center p-6 sm:p-10 backdrop-blur-[2px]">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Kirei Chisa
                </span>
              </h1>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-6 drop-shadow-md">
                Platform jual beli akun premium, OTP virtual, dan Top-Up PPOB terlengkap. 
                Transaksi cepat, aman, dan otomatis 24/7.
              </p>
              
              <Link href="#layanan" className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full font-semibold backdrop-blur-md transition-all duration-300 flex items-center gap-2 hover:gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
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
            <Link href="/premku" className="group bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">Premku</h3>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Tersedia</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Akun premium Netflix, Spotify, Canva, dll. Harga pelajar, stok selalu ready.
                  </p>
                </div>
              </div>
            </Link>

            {/* Nokos Card */}
            <Link href="/nokos" className="group bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-cyan-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-cyan-500/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
                  <Phone size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">Nokos OTP</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Realtime</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Nomor virtual luar negeri untuk verifikasi OTP WA, Tele, FB, dan lainnya.
                  </p>
                </div>
              </div>
            </Link>

            {/* PPOB Card */}
            <Link href="/ppob" className="group bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-purple-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                  <Zap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">PPOB</h3>
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Top Up</span>
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
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-blue-900/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Kenapa Memilih Kami?</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: Zap, label: 'Instan 24/7', desc: 'Proses otomatis', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
                { icon: Shield, label: 'Terjamin Aman', desc: 'Sistem enkripsi', color: 'from-emerald-400 to-green-500', shadow: 'shadow-green-500/20' },
                { icon: Clock, label: 'Stok Realtime', desc: 'Selalu update', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
                { icon: Star, label: 'Harga Miring', desc: 'Super kompetitif', color: 'from-cyan-400 to-cyan-600', shadow: 'shadow-cyan-500/20' },
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
