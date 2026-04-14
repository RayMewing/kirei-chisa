'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServerStatus from '@/components/ServerStatus';
import CountdownTimer from '@/components/CountdownTimer';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, ShoppingBag, Phone, History, RefreshCw, X, Crosshair, TerminalSquare, Zap } from 'lucide-react';
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
        if (data.order.status === 'completed') toast.success(`OTP Decrypted: ${data.order.otpCode}`);
        else if (data.order.status === 'expired') { toast('Session Expired. Credits Restored.'); fetchData(); }
      } else { toast('Awaiting Data... Please wait.'); }
    }
  };

  const cancelNokos = async (orderId: string) => {
    if (!confirm('Abort this operation?')) return;
    const res = await fetch('/api/nokos/order-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.success) { toast.success('Operation Aborted.'); fetchData(); }
    else toast.error(data.message);
  };

  const checkPremkuStatus = async (invoice: string) => {
    const res = await fetch('/api/premku/order-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice }),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Status: ${data.order.status.toUpperCase()}`);
      if (data.order.status !== 'pending' && data.order.status !== 'processing') fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Background Glow */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Crosshair className="text-red-500 animate-[spin_4s_linear_infinite]" size={28} />
              <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
                User Dashboard
              </h1>
            </div>
            <p className="text-zinc-400 font-mono text-xs pl-10">
              Welcome back, <span className="text-red-500 font-bold uppercase tracking-wider">[{user?.username || 'GUEST'}]</span>
            </p>
          </div>
          <ServerStatus />
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Premku Balance */}
          <div className="bg-zinc-900 border border-red-900/50 relative overflow-hidden p-6 group shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_25px_rgba(220,38,38,0.2)] transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
            
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShoppingBag size={14} className="text-red-500" /> Premku Credits
            </p>
            <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] mb-4">
              {user ? formatRupiah(user.premkuBalance) : '—'}
            </p>
            <Link href="/deposit?type=premku" className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/50 hover:border-red-500 px-4 py-2 uppercase tracking-wide transition-all">
              <CreditCard size={14} /> Deposit
            </Link>
          </div>

          {/* Nokos Balance */}
          <div className="bg-zinc-900 border border-zinc-700 relative overflow-hidden p-6 group shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-white/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50"></div>
            
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
              <Phone size={14} className="text-white" /> Nokos Credits
            </p>
            <p className="text-3xl font-black text-white mb-4">
              {user ? formatRupiah(user.nokosBalance) : '—'}
            </p>
            <Link href="/deposit?type=nokos" className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-white/5 text-white hover:bg-white hover:text-zinc-950 border border-white/20 hover:border-white px-4 py-2 uppercase tracking-wide transition-all">
              <CreditCard size={14} /> Deposit
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { href: '/premku', icon: ShoppingBag, label: 'Premku_DB', color: 'text-red-500 group-hover:text-white', bgHover: 'hover:bg-red-600', borderHover: 'hover:border-red-500' },
            { href: '/nokos', icon: Phone, label: 'Nokos_OTP', color: 'text-white group-hover:text-zinc-950', bgHover: 'hover:bg-white', borderHover: 'hover:border-white' },
            { href: '/history', icon: History, label: 'Sys_History', color: 'text-zinc-400 group-hover:text-white', bgHover: 'hover:bg-zinc-800', borderHover: 'hover:border-zinc-600' },
          ].map(({ href, icon: Icon, label, color, bgHover, borderHover }) => (
            <Link key={href} href={href} className={`card-product flex flex-col items-center justify-center gap-3 py-6 group ${bgHover} ${borderHover} transition-all duration-300`}>
              <Icon size={24} className={`${color} transition-colors`} />
              <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 group-hover:text-current transition-colors text-center`}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Active Nokos Orders */}
        {nokosActive.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3 border-b border-zinc-800 pb-2">
              <Zap size={20} className="text-red-500" />
              Active Orders
              <span className="bg-red-600/20 border border-red-500/50 text-red-500 font-mono text-xs px-2 py-0.5">{nokosActive.length}</span>
            </h2>
            <div className="space-y-4">
              {nokosActive.map(order => {
                const canCancel = new Date() >= new Date(order.cancelAllowedAt);
                return (
                  <div key={order._id} className="card border-l-4 border-red-500 bg-zinc-900 shadow-[0_0_15px_rgba(220,38,38,0.1)] p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          <p className="font-bold text-white uppercase tracking-wide text-sm">{order.serviceName} // {order.countryName}</p>
                        </div>
                        <p className="font-mono text-red-400 font-black text-lg tracking-widest mb-3 bg-zinc-950 w-fit px-3 py-1 border border-zinc-800">{order.phoneNumber}</p>
                        <CountdownTimer expiresAt={order.expiresAt} label="Timeout" onExpire={() => checkNokosStatus(order.orderId)} />
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => checkNokosStatus(order.orderId)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-4 py-2 transition-colors uppercase">
                          <RefreshCw size={14} /> REFRESH
                        </button>
                        {canCancel && (
                          <button onClick={() => cancelNokos(order.orderId)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-mono font-bold bg-red-950/50 hover:bg-red-900/80 text-red-500 border border-red-900 px-4 py-2 transition-colors uppercase">
                            <X size={14} /> Abort
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
          <div className="mb-8">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3 border-b border-zinc-800 pb-2">
              <TerminalSquare size={20} className="text-amber-500" />
              Pending_Queues
              <span className="bg-amber-600/20 border border-amber-500/50 text-amber-500 font-mono text-xs px-2 py-0.5">{premkuPending.length}</span>
            </h2>
            <div className="space-y-4">
              {premkuPending.map(order => (
                <div key={order._id} className="card border-l-2 border-amber-500 bg-zinc-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-white uppercase text-sm mb-1">{order.productName}</p>
                    <p className="text-xs text-zinc-500 font-mono mb-2">ID: {order.invoice}</p>
                    <span className="badge-pending animate-pulse">Processing_Data</span>
                  </div>
                  <button onClick={() => checkPremkuStatus(order.invoice)}
                    className="flex items-center justify-center gap-2 text-xs font-mono font-bold bg-amber-950/30 hover:bg-amber-900/50 text-amber-500 border border-amber-900/50 px-4 py-2 transition-colors uppercase flex-shrink-0">
                    <RefreshCw size={14} /> Verify_Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && nokosActive.length === 0 && premkuPending.length === 0 && (
          <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
            <Crosshair size={40} className="mx-auto mb-4 text-zinc-700 animate-[spin_10s_linear_infinite]" />
            <p className="font-mono text-zinc-400 uppercase tracking-widest text-sm mb-2">{'>>'} No_Active_Tasks</p>
            <p className="text-xs text-zinc-600 font-mono mb-6">Initialize a new process from the database.</p>
            <div className="flex gap-4 justify-center relative z-10">
              <Link href="/premku" className="btn-primary text-xs py-2 px-6">{'>>'} Premku</Link>
              <Link href="/nokos" className="btn-secondary text-xs py-2 px-6">{'>>'} Nokos</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
