'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Receipt, TerminalSquare } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

type Tab = 'premku-deposits' | 'nokos-deposits' | 'premku-orders' | 'nokos-orders';

interface PremkuDeposit { _id: string; invoice: string; amount: number; totalBayar: number; status: string; confirmedByAdmin: boolean; createdAt: string; userId: { username: string; email: string }; }
interface NokosDeposit { _id: string; depositId: string; amount: number; diterima: number; status: string; createdAt: string; userId: { username: string; email: string }; }
interface PremkuOrder { _id: string; invoice: string; productName: string; total: number; qty: number; status: string; createdAt: string; userId: { username: string }; }
interface NokosOrder { _id: string; orderId: string; serviceName: string; countryName: string; phoneNumber: string; price: number; status: string; otpCode: string; createdAt: string; userId: { username: string }; }

const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = { success: 'badge-success', completed: 'badge-success', confirmed: 'badge-success', pending: 'badge-pending', processing: 'badge-pending', active: 'badge-active', failed: 'badge-failed', canceled: 'badge-failed', cancel: 'badge-failed', expired: 'badge-failed' };
  return <span className={map[s] || 'badge-pending'}>{s.toUpperCase()}</span>;
};

export default function AdminTransactionsPage() {
  const [tab, setTab] = useState<Tab>('premku-deposits');
  const [data, setData] = useState<{ premkuDeposits: PremkuDeposit[]; nokosDeposits: NokosDeposit[]; premkuOrders: PremkuOrder[]; nokosOrders: NokosOrder[] }>({ premkuDeposits: [], nokosDeposits: [], premkuOrders: [], nokosOrders: [] });
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/transactions').then(r => r.json()).then(d => {
      if (d.success) setData({ premkuDeposits: d.premkuDeposits, nokosDeposits: d.nokosDeposits, premkuOrders: d.premkuOrders, nokosOrders: d.nokosOrders });
    }).finally(() => setLoading(false));
  }, []);

  const confirmDeposit = async (id: string) => {
    if (!confirm('Authorize this deposit and inject funds to user node?')) return;
    setConfirming(id);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, type: 'premku' }),
      });
      const d = await res.json();
      if (d.success) { 
        toast.success('Funds Injected Successfully.'); 
        setData(prev => ({ ...prev, premkuDeposits: prev.premkuDeposits.map(dep => dep._id === id ? { ...dep, status: 'confirmed', confirmedByAdmin: true } : dep) })); 
      }
      else toast.error(`Sys_Error: ${d.message}`);
    } finally { setConfirming(null); }
  };

  const tabs = [
    { id: 'premku-deposits' as Tab, label: 'Premku_Deposits' },
    { id: 'nokos-deposits' as Tab, label: 'Nokos_Deposits' },
    { id: 'premku-orders' as Tab, label: 'Premku_Orders' },
    { id: 'nokos-orders' as Tab, label: 'Nokos_Orders' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <Receipt className="text-red-500" size={28} />
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Sys_Transactions
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{'>>'} Financial & Operational Logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-l-2 border-red-600 pl-3 bg-zinc-950/50 p-2 overflow-x-auto custom-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              tab === t.id 
                ? 'bg-red-950/30 text-red-500 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 relative overflow-hidden">
          {/* Scanlines & Tech Corners */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600 z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600 z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
          
          <div className="overflow-x-auto relative z-10 custom-scrollbar">
            
            {/* PREMKU DEPOSITS */}
            {tab === 'premku-deposits' && (
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">User_Node</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Invoice_ID</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Amount</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Sys_Status</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Timestamp</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.premkuDeposits.map(dep => (
                    <tr key={dep._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-white uppercase tracking-wide">{dep.userId?.username}</td>
                      <td className="px-5 py-4 text-xs font-mono text-zinc-500">{dep.invoice}</td>
                      <td className="px-5 py-4 text-sm font-black font-mono text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(dep.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge s={dep.status} /></td>
                      <td className="px-5 py-4 text-[10px] font-mono text-zinc-400 uppercase">{fmtDate(dep.createdAt)}</td>
                      <td className="px-5 py-4">
                        {dep.status === 'pending' && !dep.confirmedByAdmin && (
                          <button onClick={() => confirmDeposit(dep._id)} disabled={confirming === dep._id}
                            className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-900/50 text-emerald-500 px-3 py-2 transition-colors">
                            {confirming === dep._id ? <span className="spinner border-emerald-500/30 border-t-emerald-500 scale-75" /> : <><CheckCircle size={12} /> Authorize</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.premkuDeposits.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-xs font-mono text-zinc-600 uppercase tracking-widest">{'>>'} No_Data_Found</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* NOKOS DEPOSITS */}
            {tab === 'nokos-deposits' && (
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">User_Node</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Deposit_ID</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Received</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Sys_Status</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.nokosDeposits.map(dep => (
                    <tr key={dep._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-white uppercase tracking-wide">{dep.userId?.username}</td>
                      <td className="px-5 py-4 text-xs font-mono text-zinc-500">{dep.depositId}</td>
                      <td className="px-5 py-4 text-sm font-black font-mono text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">{formatRupiah(dep.diterima)}</td>
                      <td className="px-5 py-4"><StatusBadge s={dep.status} /></td>
                      <td className="px-5 py-4 text-[10px] font-mono text-zinc-400 uppercase">{fmtDate(dep.createdAt)}</td>
                    </tr>
                  ))}
                  {data.nokosDeposits.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-xs font-mono text-zinc-600 uppercase tracking-widest">{'>>'} No_Data_Found</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* PREMKU ORDERS */}
            {tab === 'premku-orders' && (
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">User_Node</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Module</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Total_Cost</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Sys_Status</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.premkuOrders.map(o => (
                    <tr key={o._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-white uppercase tracking-wide">{o.userId?.username}</td>
                      <td className="px-5 py-4 text-xs font-mono text-zinc-300 uppercase">{o.productName}</td>
                      <td className="px-5 py-4 text-sm font-black font-mono text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(o.total)}</td>
                      <td className="px-5 py-4"><StatusBadge s={o.status} /></td>
                      <td className="px-5 py-4 text-[10px] font-mono text-zinc-400 uppercase">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                  {data.premkuOrders.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-xs font-mono text-zinc-600 uppercase tracking-widest">{'>>'} No_Data_Found</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {/* NOKOS ORDERS */}
            {tab === 'nokos-orders' && (
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">User_Node</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Service // Region</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Virtual_No</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Decrypted_Key</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Cost</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Sys_Status</th>
                    <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.nokosOrders.map(o => (
                    <tr key={o._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-white uppercase tracking-wide">{o.userId?.username}</td>
                      <td className="px-5 py-4 text-[10px] font-mono text-zinc-300 uppercase">{o.serviceName} <span className="text-zinc-600 mx-1">||</span> {o.countryName}</td>
                      <td className="px-5 py-4 text-xs font-mono font-bold text-blue-400">{o.phoneNumber}</td>
                      <td className="px-5 py-4 text-sm font-black font-mono text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{o.otpCode || '—'}</td>
                      <td className="px-5 py-4 text-sm font-black font-mono text-blue-500">{formatRupiah(o.price)}</td>
                      <td className="px-5 py-4"><StatusBadge s={o.status} /></td>
                      <td className="px-5 py-4 text-[10px] font-mono text-zinc-400 uppercase">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                  {data.nokosOrders.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-xs font-mono text-zinc-600 uppercase tracking-widest">{'>>'} No_Data_Found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
