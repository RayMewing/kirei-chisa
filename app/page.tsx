import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerSlider from '@/components/BannerSlider';
import ServerStatus from '@/components/ServerStatus';
import Link from 'next/link';
import { ShoppingBag, Phone, Zap, Shield, Clock, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Selamat Datang di <span className="text-brand">Kirei Chisa</span> 🎉
              </h1>
              <p className="text-gray-500 text-sm mt-1">Platform jual beli akun premium & OTP virtual terpercaya</p>
            </div>
            <ServerStatus />
          </div>
          <BannerSlider />
        </section>

        {/* Services */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Layanan Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Premku Card */}
            <Link href="/premku" className="group card hover:border-brand/30 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center group-hover:bg-brand/20 transition-colors flex-shrink-0">
                  <ShoppingBag size={26} className="text-brand" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">Premku</h3>
                    <span className="badge-success text-xs">Tersedia</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Akun premium Netflix, Spotify, Alight Motion, CapCut, dan lainnya. Harga terjangkau, stok selalu ready.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-brand text-sm font-semibold group-hover:gap-2 transition-all">
                    Lihat produk →
                  </span>
                </div>
              </div>
            </Link>

            {/* Nokos Card */}
            <Link href="/nokos" className="group card hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Phone size={26} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">Nokos OTP</h3>
                    <span className="badge-active text-xs">Realtime</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Nomor virtual dari berbagai negara untuk verifikasi OTP WhatsApp, Telegram, Facebook, dan lainnya.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Pesan nomor →
                  </span>
                </div>
              </div>
            </Link>

            {/* PPOB Card */}
            <Link href="/ppob" className="group card hover:border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors flex-shrink-0">
                  <Zap size={26} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">PPOB</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">Top Up</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Top up game (Free Fire, ML, PUBG), isi saldo e-wallet (DANA, OVO, GoPay), dan pulsa semua operator.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-purple-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Lihat layanan →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Kenapa Kirei Chisa?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Zap, label: 'Transaksi Instan', desc: 'Proses otomatis 24 jam', color: 'text-yellow-500 bg-yellow-50' },
              { icon: Shield, label: 'Aman & Terpercaya', desc: 'Sistem terenkripsi', color: 'text-green-600 bg-green-50' },
              { icon: Clock, label: 'Stok Realtime', desc: 'Update otomatis', color: 'text-blue-600 bg-blue-50' },
              { icon: Star, label: 'Harga Terbaik', desc: 'Kompetitif & transparan', color: 'text-brand bg-brand/10' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="card text-center hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
                  <Icon size={22} />
                </div>
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
