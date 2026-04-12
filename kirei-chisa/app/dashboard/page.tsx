'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServerStatus from '@/components/ServerStatus';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, ShoppingBag, Phone, History, RefreshCw, X } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface User { username: string; email: string; premkuBalance: number; nokosBalance: number; createdAt: string; }
interface NokosOrder {
  _id: string; orderId: string; phoneNumber: string; serviceName: string;
  countryName: string; price: number; status: string; expiresAt: string; cancelAllowedAt: string;
}
interface PremkuOrder { _id: string; invoice: string; productName: string; total: number; status: string; }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [nokosActive, setNokosActive] = useState<NokosOrder[]>([]);
  const [premkuPending, setPremkuPending] = useState<PremkuOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, activeRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/active-orders'),
      ]);
      const userData = await userRes.json();
      const activeData = await activeRes.json();
      if (userData.success) setUser(userData.data);
      if (activeData.success) {
        setNokosActive(activeData.nokosActive);
        setPremkuPending(activeData.premkuPending);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const checkNokosStatus = async (orderId: string) => {
    const res = await fetch('/api/nokos/order-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.order.status !== 'active') {
        setNokosActive(prev => prev.filter(o => o.orderId !== orderId));
        if (data.order.status === 'completed') toast.success(`OTP: ${data.order.otpCode}`);
        else if (data.order.status === 'expired') { toast('Pesanan expired. Saldo dikembalikan.'); fetchData(); }
      } else { toast('OTP belum masuk, coba lagi sebentar.'); }
    }
  };

  const cancelNokos = async (orderId: string) => {
    if (!confirm('Batalkan pesanan ini?')) return;
    const res = await fetch('/api/nokos/order-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.success) { toast.success(data.message); fetchData(); }
    else toast.error(data.message);
  };

  const checkPremkuStatus = async (invoice: string) => {
    const res = await fetch('/api/premku/order-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice }),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Status: ${data.order.status}`);
      if (data.order.status !== 'pending' && data.order.status !== 'processing') fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-sm text-gray-500">Selamat datang, <span className="font-semibold text-gray-700">{user?.username}</span>!</p>
          </div>
          <ServerStatus />
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-5 text-white shadow-md">
            <p className="text-sm text-white/75 mb-1 flex items-center gap-1.5"><ShoppingBag size={14} />Saldo Premku</p>
            <p className="text-3xl font-bold">{user ? formatRupiah(user.premkuBalance) : '—'}</p>
            <Link href="/deposit?type=premku" className="inline-flex items-center gap-1 mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              <CreditCard size={12} /> Top Up
            </Link>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-md">
            <p className="text-sm text-white/75 mb-1 flex items-center gap-1.5"><Phone size={14} />Saldo Nokos</p>
            <p className="text-3xl font-bold">{user ? formatRupiah(user.nokosBalance) : '—'}</p>
            <Link href="/deposit?type=nokos" className="inline-flex items-center gap-1 mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              <CreditCard size={12} /> Top Up
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { href: '/premku', icon: ShoppingBag, label: 'Beli Premku', color: 'text-brand bg-brand/10' },
            { href: '/nokos', icon: Phone, label: 'Beli Nokos', color: 'text-blue-600 bg-blue-50' },
            { href: '/history', icon: History, label: 'Riwayat', color: 'text-purple-600 bg-purple-50' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </Link>
          ))}
        </div>

        {/* Active Nokos Orders */}
        {nokosActive.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Phone size={16} className="text-blue-600" />
              Pesanan Nokos Aktif
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{nokosActive.length}</span>
            </h2>
            <div className="space-y-3">
              {nokosActive.map(order => {
                const canCancel = new Date() >= new Date(order.cancelAllowedAt);
                return (
                  <div key={order._id} className="card border border-blue-100 bg-blue-50/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{order.serviceName} — {order.countryName}</p>
                        <p className="font-mono text-blue-600 font-bold mt-0.5">{order.phoneNumber}</p>
                        <div className="mt-1.5">
                          <CountdownTimer expiresAt={order.expiresAt} label="Waktu OTP" onExpire={() => checkNokosStatus(order.orderId)} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => checkNokosStatus(order.orderId)}
                          className="flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors">
                          <RefreshCw size={11} /> Cek OTP
                        </button>
                        {canCancel && (
                          <button onClick={() => cancelNokos(order.orderId)}
                            className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors">
                            <X size={11} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Premku Orders */}
        {premkuPending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-brand" />
              Pesanan Premku Pending
              <span className="bg-brand/10 text-brand text-xs px-2 py-0.5 rounded-full">{premkuPending.length}</span>
            </h2>
            <div className="space-y-3">
              {premkuPending.map(order => (
                <div key={order._id} className="card border border-brand/20 bg-red-50/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.productName}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{order.invoice}</p>
                    <span className="badge-pending mt-1">Pending</span>
                  </div>
                  <button onClick={() => checkPremkuStatus(order.invoice)}
                    className="flex items-center gap-1 text-xs bg-brand/10 hover:bg-brand/20 text-brand px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0">
                    <RefreshCw size={11} /> Cek Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && nokosActive.length === 0 && premkuPending.length === 0 && (
          <div className="card text-center py-10 text-gray-400">
            <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada pesanan aktif</p>
            <p className="text-sm mt-1">Mulai belanja di halaman Premku atau Nokos</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/premku" className="btn-primary text-sm py-2 px-4">Ke Premku</Link>
              <Link href="/nokos" className="btn-secondary text-sm py-2 px-4">Ke Nokos</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
