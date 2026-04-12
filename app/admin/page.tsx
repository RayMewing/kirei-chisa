'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ShoppingBag, Phone, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
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
    { label: 'Total User', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-blue-500 to-blue-600', href: '/admin/users' },
    { label: 'Order Premku', value: stats.totalPremkuOrders.toLocaleString(), icon: ShoppingBag, color: 'from-brand to-brand-dark', href: '/admin/transactions' },
    { label: 'Order Nokos', value: stats.totalNokosOrders.toLocaleString(), icon: Phone, color: 'from-purple-500 to-purple-600', href: '/admin/transactions' },
    { label: 'Total Pemasukan', value: formatRupiah(stats.premkuRevenue + stats.nokosRevenue), icon: TrendingUp, color: 'from-green-500 to-green-600', href: '/admin/transactions' },
    { label: 'Pemasukan Premku', value: formatRupiah(stats.premkuRevenue), icon: CreditCard, color: 'from-orange-400 to-orange-500', href: '/admin/transactions' },
    { label: 'Pemasukan Nokos', value: formatRupiah(stats.nokosRevenue), icon: CreditCard, color: 'from-teal-500 to-teal-600', href: '/admin/transactions' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selamat datang di panel admin Kirei Chisa</p>
      </div>

      {stats?.pendingDeposits && stats.pendingDeposits > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Ada {stats.pendingDeposits} deposit pending</p>
            <p className="text-xs text-yellow-600">Beberapa deposit mungkin delay dan perlu konfirmasi manual.</p>
          </div>
          <Link href="/admin/transactions" className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg transition-colors font-medium flex-shrink-0">
            Lihat →
          </Link>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/users', label: 'Kelola User', desc: 'Lihat dan atur saldo user', icon: Users, color: 'text-blue-600 bg-blue-50' },
          { href: '/admin/transactions', label: 'Transaksi', desc: 'Konfirmasi deposit & monitor order', icon: ShoppingBag, color: 'text-brand bg-brand/10' },
          { href: '/admin/banners', label: 'Banner Promosi', desc: 'Atur banner di halaman utama', icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
          { href: '/admin/settings', label: 'Pengaturan', desc: 'Sosmed, FAQ, harga deposit', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
