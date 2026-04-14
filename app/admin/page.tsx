'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ShoppingBag, Phone, CreditCard, TrendingUp, AlertCircle, Crosshair, TerminalSquare, Zap } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface Stats {
  totalUsers: number; totalOrders: number; totalPremkuOrders: number;
  totalNokosOrders: number; premkuRevenue: number; nokosRevenue: number; pendingDeposits: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      if (d.success) setStats(d.stats);
    }).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'TOTAL NODE USER', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-950/20', border: 'border-blue-900/50', hover: 'hover:border-blue-500', shadow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]', href: '/admin/users' },
    { label: 'PESANAN PREMKU', value: stats.totalPremkuOrders.toLocaleString(), icon: ShoppingBag, color: 'text-red-500', bg: 'bg-red-950/20', border: 'border-red-900/50', hover: 'hover:border-red-500', shadow: 'hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]', href: '/admin/transactions' },
    { label: 'PESANAN NOKOS', value: stats.totalNokosOrders.toLocaleString(), icon: Phone, color: 'text-purple-500', bg: 'bg-purple-950/20', border: 'border-purple-900/50', hover: 'hover:border-purple-500', shadow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]', href: '/admin/transactions' },
    { label: 'TOTAL PENDAPATAN', value: formatRupiah(stats.premkuRevenue + stats.nokosRevenue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-950/20', border: 'border-emerald-900/50', hover: 'hover:border-emerald-500', shadow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]', href: '/admin/transactions' },
    { label: 'PENDAPATAN PREMKU', value: formatRupiah(stats.premkuRevenue), icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-950/20', border: 'border-orange-900/50', hover: 'hover:border-orange-500', shadow: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]', href: '/admin/transactions' },
    { label: 'PENDAPATAN NOKOS', value: formatRupiah(stats.nokosRevenue), icon: CreditCard, color: 'text-teal-500', bg: 'bg-teal-950/20', border: 'border-teal-900/50', hover: 'hover:border-teal-500', shadow: 'hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]', href: '/admin/transactions' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <TerminalSquare className="text-red-500" size={28} />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Tinjauan Sistem
          </h1>
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-10">
          {'>>'} Telemetri Pusat Komando Kirei Chisa
        </p>
      </div>

      {/* Warning Alert */}
      {stats?.pendingDeposits && stats.pendingDeposits > 0 ? (
        <div className="bg-amber-950/20 border border-amber-500/50 p-4 flex items-start sm:items-center gap-4 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
          <AlertCircle size={24} className="text-amber-500 flex-shrink-0 animate-pulse relative z-10" />
          <div className="flex-1 relative z-10">
            <p className="text-xs font-black font-mono uppercase tracking-widest text-amber-500 mb-1">
              [PERINGATAN SISTEM] {stats.pendingDeposits} Deposit Tertunda Terdeteksi
            </p>
            <p className="text-[10px] font-mono text-amber-600/80 uppercase tracking-widest">
              Verifikasi manual diperlukan untuk node deposit yang tertunda.
            </p>
          </div>
          <Link href="/admin/transactions" className="text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 px-4 py-2 transition-colors flex-shrink-0 relative z-10">
            Tindak Lanjuti {'>>'}
          </Link>
        </div>
      ) : null}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 animate-pulse relative">
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-700"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-700"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg, border, hover, shadow, href }) => (
            <Link key={label} href={href} className={`group ${bg} border ${border} ${hover} ${shadow} p-5 relative overflow-hidden transition-all duration-300`}>
              {/* Tech Corners */}
              <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${color.replace('text-', 'border-')} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${color.replace('text-', 'border-')} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 bg-zinc-950 border ${border} flex items-center justify-center`}>
                    <Icon size={18} className={`${color}`} />
                  </div>
                  <Crosshair size={14} className="text-zinc-600 group-hover:animate-[spin_4s_linear_infinite]" />
                </div>
                <div className="mt-auto">
                  <p className={`text-2xl sm:text-3xl font-black font-mono ${color} tracking-tight mb-1 drop-shadow-[0_0_5px_currentColor]`}>{value}</p>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Access Links */}
      <div className="mt-8">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
          <Zap size={16} className="text-red-500" /> Arahan Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/admin/users', label: 'Kelola Node User', desc: 'Pantau dan sesuaikan saldo pengguna', icon: Users, color: 'text-blue-500', border: 'group-hover:border-blue-500' },
            { href: '/admin/transactions', label: 'Verifikasi Transaksi', desc: 'Konfirmasi deposit & lacak pesanan', icon: ShoppingBag, color: 'text-red-500', border: 'group-hover:border-red-500' },
            { href: '/admin/banners', label: 'Konfigurasi Banner', desc: 'Modifikasi tampilan visual web', icon: CreditCard, color: 'text-purple-500', border: 'group-hover:border-purple-500' },
            { href: '/admin/settings', label: 'Pengaturan Inti', desc: 'Atur tautan sosial, FAQ & harga', icon: TrendingUp, color: 'text-emerald-500', border: 'group-hover:border-emerald-500' },
          ].map(({ href, label, desc, icon: Icon, color, border }) => (
            <Link key={href} href={href} className={`bg-zinc-900 border border-zinc-800 ${border} p-4 flex items-center gap-4 transition-all duration-300 group relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
              <div className={`w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 relative z-10 transition-colors ${border}`}>
                <Icon size={20} className={`${color}`} />
              </div>
              <div className="relative z-10 min-w-0 flex-1">
                <p className="font-bold font-mono text-white text-xs sm:text-sm uppercase tracking-widest mb-1 truncate">{label}</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
