'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { History, ShoppingBag, Phone, CreditCard, RefreshCw, X, Copy, Terminal, Crosshair } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

type Tab = 'premku-orders' | 'nokos-orders' | 'premku-deposits' | 'nokos-deposits';

// Interfaces biar kode lebih bersih & gak error TypeScript
interface Account { username: string; password: string; }
interface PremkuOrder { _id: string; invoice: string; productName: string; total: number; status: string; createdAt: string; accounts?: Account[]; }
interface NokosOrder { _id: string; orderId: string; phoneNumber: string; serviceName: string; countryName: string; price: number; status: string; otpCode?: string; createdAt: string; }
interface PremkuDeposit { _id: string; invoice: string; amount: number; kodeUnik: number; status: string; createdAt: string; }
interface NokosDeposit { _id: string; depositId: string; diterima: number; status: string; createdAt: string; }

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('premku-orders');
  const [data, setData] = useState<{
    premkuOrders: PremkuOrder[];
    nokosOrders: NokosOrder[];
    premkuDeposits: PremkuDeposit[];
    nokosDeposits: NokosDeposit[];
  }>({ premkuOrders: [], nokosOrders: [], premkuDeposits: [], nokosDeposits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/history').then(r => r.json()).then(d => {
      if (d.success) setData({ premkuOrders: d.premkuOrders, nokosOrders: d.nokosOrders, premkuDeposits: d.premkuDeposits, nokosDeposits: d.nokosDeposits });
    }).finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      success: 'badge-success', completed: 'badge-success', confirmed: 'badge-success',
      pending: 'badge-pending', processing: 'badge-pending', refunded: 'badge-pending',
      active: 'badge-active',
      failed: 'badge-failed', canceled: 'badge-failed', cancel: 'badge-failed', expired: 'badge-failed', 
    };
    return <span className={map[status] || 'badge-pending'}>{status}</span>;
  };

  const checkPremkuOrder = async (invoice: string) => {
    const res = await fetch('/api/premku/order-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice }) });
    const d = await res.json();
    if (d.success) {
      toast(`System Log: ${d.order.status.toUpperCase()}`);
      setData(prev => ({ ...prev, premkuOrders: prev.premkuOrders.map(o => o.invoice === invoice ? { ...o, status: d.order.status, accounts: d.order.accounts } : o) }));
    }
  };

  const checkNokosOrder = async (orderId: string) => {
    const res = await fetch('/api/nokos/order-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
    const d = await res.json();
    if (d.success) {
      if (d.order.otpCode) toast.success(`Decrypted Key: ${d.order.otpCode}`);
      else toast(`System Log: ${d.order.status.toUpperCase()}`);
      setData(prev => ({ ...prev, nokosOrders: prev.nokosOrders.map(o => o.orderId === orderId ? { ...o, status: d.order.status, otpCode: d.order.otpCode } : o) }));
    }
  };

  const cancelNokosOrder = async (orderId: string) => {
    if (!confirm('Abort this operation?')) return;
    const res = await fetch('/api/nokos/order-cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
    const d = await res.json();
    if (d.success) { toast.success('Operation Aborted.'); setData(prev => ({ ...prev, nokosOrders: prev.nokosOrders.map(o => o.orderId === orderId ? { ...o, status: 'canceled' } : o) })); }
    else toast.error(d.message);
  };

  const checkPremkuDeposit = async (invoice: string) => {
    const res = await fetch('/api/premku/deposit-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice }) });
    const d = await res.json();
    if (d.success) {
      toast(d.deposit.status === 'success' ? 'Funds Injected!' : `System Log: ${d.deposit.status.toUpperCase()}`);
      setData(prev => ({ ...prev, premkuDeposits: prev.premkuDeposits.map(dep => dep.invoice === invoice ? { ...dep, status: d.deposit.status } : dep) }));
    }
  };

  const cancelPremkuDeposit = async (invoice: string) => {
    if (!confirm('Cancel deposit sequence?')) return;
    const res = await fetch('/api/premku/deposit-cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice }) });
    const d = await res.json();
    if (d.success) { toast.success('Sequence canceled.'); setData(prev => ({ ...prev, premkuDeposits: prev.premkuDeposits.map(dep => dep.invoice === invoice ? { ...dep, status: 'canceled' } : dep) })); }
    else toast.error(d.message);
  };

  const checkNokosDeposit = async (depositId: string) => {
    const res = await fetch('/api/nokos/deposit-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId }) });
    const d = await res.json();
    if (d.success) { toast(d.deposit.status === 'success' ? 'Funds Injected!' : `System Log: ${d.deposit.status.toUpperCase()}`); }
  };

  const cancelNokosDeposit = async (depositId: string) => {
    if (!confirm('Cancel deposit sequence?')) return;
    const res = await fetch('/api/nokos/deposit-cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId }) });
    const d = await res.json();
    if (d.success) toast.success('Sequence canceled.'); else toast.error(d.message);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'premku-orders', label: 'Premku_Orders', icon: ShoppingBag },
    { id: 'nokos-orders', label: 'Nokos_Orders', icon: Phone },
    { id: 'premku-deposits', label: 'Premku_Funds', icon: CreditCard },
    { id: 'nokos-deposits', label: 'Nokos_Funds', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-red-600/5 blur-[120px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Header Title */}
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <History className="text-red-500" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Sys_History
            </h1>
          </div>
          <p className="text-zinc-500 font-mono text-xs pl-10">{'>>'} Transaction logs & execution records_</p>
        </div>

        {/* Terminal Tabs */}
        <div className="flex gap-2 flex-wrap mb-6 border-l-2 border-red-600 pl-3 bg-zinc-950/50 p-2">
          <Terminal size={16} className="text-zinc-500 mt-1.5 hidden sm:block" />
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm uppercase tracking-wider transition-all border ${
                tab === id 
                  ? 'bg-red-600/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)] font-bold' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-red-500/30 hover:text-red-400'
              }`}>
              <Icon size={14} className={tab === id ? 'text-red-500' : 'text-zinc-500'} />
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-zinc-900/50 border border-zinc-800 rounded-none" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* PREMKU ORDERS */}
            {tab === 'premku-orders' && (
              data.premkuOrders.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 font-mono text-zinc-500 uppercase text-xs tracking-widest">
                  {'>>'} NO_RECORDS_FOUND
                </div>
              ) : data.premkuOrders.map((o) => (
                <div key={o._id} className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 p-4 relative group transition-colors overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                    <div className="flex-1">
                      <p className="font-bold text-white uppercase tracking-wide text-sm mb-1">{o.productName}</p>
                      <p className="text-xs font-mono text-zinc-500 mb-2">ID: {o.invoice}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={o.status} />
                        <span className="text-xs font-mono text-zinc-400">{fmtDate(o.createdAt)}</span>
                        <span className="text-xs font-mono font-bold text-red-500">{formatRupiah(o.total)}</span>
                      </div>
                      
                      {o.status === 'success' && o.accounts && o.accounts.length > 0 && (
                        <div className="mt-4 bg-emerald-950/20 border border-emerald-900/50 p-3 space-y-2">
                          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-1">Decrypted_Keys:</p>
                          {o.accounts.map((acc, i) => (
                            <div key={i} className="text-xs font-mono flex items-center justify-between gap-4 bg-emerald-950/50 px-2 py-1.5 border border-emerald-900/30">
                              <span className="text-emerald-400 truncate">ID: {acc.username} <span className="text-zinc-600 mx-1">||</span> PASS: {acc.password}</span>
                              <button onClick={() => { navigator.clipboard.writeText(`ID: ${acc.username} | PASS: ${acc.password}`); toast.success('Data Copied!'); }}
                                className="text-emerald-600 hover:text-emerald-400 transition-colors flex-shrink-0">
                                <Copy size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => checkPremkuOrder(o.invoice)}
                      className="text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 transition-colors sm:w-auto w-full">
                      <RefreshCw size={14} /> Ping
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* NOKOS ORDERS */}
            {tab === 'nokos-orders' && (
              data.nokosOrders.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 font-mono text-zinc-500 uppercase text-xs tracking-widest">
                  {'>>'} NO_RECORDS_FOUND
                </div>
              ) : data.nokosOrders.map((o) => (
                <div key={o._id} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 p-4 relative group transition-colors overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                    <div className="flex-1">
                      <p className="font-bold text-white uppercase tracking-wide text-sm mb-1">{o.serviceName} // {o.countryName}</p>
                      <p className="font-mono text-blue-500 font-bold text-lg tracking-widest mb-1">{o.phoneNumber}</p>
                      {o.otpCode && <p className="text-emerald-400 font-black font-mono text-xl mt-1 mb-2 bg-emerald-950/30 border border-emerald-900 w-fit px-3 py-1 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">OTP: {o.otpCode}</p>}
                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        <StatusBadge status={o.status} />
                        <span className="text-xs font-mono text-zinc-400">{fmtDate(o.createdAt)}</span>
                        <span className="text-xs font-mono font-bold text-blue-500">{formatRupiah(o.price)}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                      <button onClick={() => checkNokosOrder(o.orderId)}
                        className="flex-1 sm:flex-none text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 transition-colors">
                        <RefreshCw size={14} /> Ping
                      </button>
                      {o.status === 'active' && (
                        <button onClick={() => cancelNokosOrder(o.orderId)}
                          className="flex-1 sm:flex-none text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900 text-red-500 px-4 py-2 transition-colors">
                          <X size={14} /> Abort
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* PREMKU DEPOSITS */}
            {tab === 'premku-deposits' && (
              data.premkuDeposits.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 font-mono text-zinc-500 uppercase text-xs tracking-widest">
                  {'>>'} NO_RECORDS_FOUND
                </div>
              ) : data.premkuDeposits.map((d) => (
                <div key={d._id} className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 p-4 relative transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white uppercase text-sm mb-1 flex items-center gap-2"><CreditCard size={14} className="text-red-500" /> Premku_Funds_Inject</p>
                      <p className="text-xs font-mono text-zinc-500 mb-3">ID: {d.invoice}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={d.status} />
                        <span className="text-xs font-mono text-zinc-400">{fmtDate(d.createdAt)}</span>
                        <span className="text-sm font-mono font-bold text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                          {formatRupiah(d.amount)}
                          {d.kodeUnik > 0 && <span className="text-xs text-red-700 ml-1">+{d.kodeUnik}</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button onClick={() => checkPremkuDeposit(d.invoice)}
                        className="flex-1 sm:flex-none text-xs font-mono uppercase flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 transition-colors">
                        <RefreshCw size={14} /> Ping
                      </button>
                      {d.status === 'pending' && (
                        <button onClick={() => cancelPremkuDeposit(d.invoice)} 
                          className="flex-1 sm:flex-none text-xs font-mono uppercase flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900 text-red-500 px-4 py-2 transition-colors">
                          <X size={14} /> Abort
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* NOKOS DEPOSITS */}
            {tab === 'nokos-deposits' && (
              data.nokosDeposits.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-900/30 text-center py-12 font-mono text-zinc-500 uppercase text-xs tracking-widest">
                  {'>>'} NO_RECORDS_FOUND
                </div>
              ) : data.nokosDeposits.map((d) => (
                <div key={d._id} className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 p-4 relative transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white uppercase text-sm mb-1 flex items-center gap-2"><CreditCard size={14} className="text-blue-500" /> Nokos_Funds_Inject</p>
                      <p className="text-xs font-mono text-zinc-500 mb-3">ID: {d.depositId}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={d.status} />
                        <span className="text-xs font-mono text-zinc-400">{fmtDate(d.createdAt)}</span>
                        <span className="text-sm font-mono font-bold text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                          {formatRupiah(d.diterima)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button onClick={() => checkNokosDeposit(d.depositId)}
                        className="flex-1 sm:flex-none text-xs font-mono uppercase flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 transition-colors">
                        <RefreshCw size={14} /> Ping
                      </button>
                      {d.status === 'pending' && (
                        <button onClick={() => cancelNokosDeposit(d.depositId)} 
                          className="flex-1 sm:flex-none text-xs font-mono uppercase flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900 text-red-500 px-4 py-2 transition-colors">
                          <X size={14} /> Abort
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
