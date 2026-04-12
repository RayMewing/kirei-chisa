'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

type Tab = 'premku-deposits' | 'nokos-deposits' | 'premku-orders' | 'nokos-orders';

interface PremkuDeposit { _id: string; invoice: string; amount: number; totalBayar: number; status: string; confirmedByAdmin: boolean; createdAt: string; userId: { username: string; email: string }; }
interface NokosDeposit { _id: string; depositId: string; amount: number; diterima: number; status: string; createdAt: string; userId: { username: string; email: string }; }
interface PremkuOrder { _id: string; invoice: string; productName: string; total: number; qty: number; status: string; createdAt: string; userId: { username: string }; }
interface NokosOrder { _id: string; orderId: string; serviceName: string; countryName: string; phoneNumber: string; price: number; status: string; otpCode: string; createdAt: string; userId: { username: string }; }

const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = { success: 'badge-success', completed: 'badge-success', confirmed: 'badge-success', pending: 'badge-pending', processing: 'badge-pending', active: 'badge-active', failed: 'badge-failed', canceled: 'badge-failed', cancel: 'badge-failed', expired: 'badge-failed' };
  return <span className={map[s] || 'badge-pending'}>{s}</span>;
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
    if (!confirm('Konfirmasi deposit ini dan tambahkan saldo ke user?')) return;
    setConfirming(id);
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, type: 'premku' }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); setData(prev => ({ ...prev, premkuDeposits: prev.premkuDeposits.map(dep => dep._id === id ? { ...dep, status: 'confirmed', confirmedByAdmin: true } : dep) })); }
      else toast.error(d.message);
    } finally { setConfirming(null); }
  };

  const tabs = [
    { id: 'premku-deposits' as Tab, label: 'Deposit Premku' },
    { id: 'nokos-deposits' as Tab, label: 'Deposit Nokos' },
    { id: 'premku-orders' as Tab, label: 'Order Premku' },
    { id: 'nokos-orders' as Tab, label: 'Order Nokos' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-gray-900">Transaksi</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${tab === t.id ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {tab === 'premku-deposits' && (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Invoice</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Nominal</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tanggal</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Aksi</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.premkuDeposits.map(dep => (
                    <tr key={dep._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{dep.userId?.username}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{dep.invoice}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand">{formatRupiah(dep.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge s={dep.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(dep.createdAt)}</td>
                      <td className="px-4 py-3">
                        {dep.status === 'pending' && !dep.confirmedByAdmin && (
                          <button onClick={() => confirmDeposit(dep._id)} disabled={confirming === dep._id}
                            className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg transition-colors">
                            {confirming === dep._id ? <span className="spinner spinner-brand scale-75" /> : <><CheckCircle size={11} />Konfirmasi</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'nokos-deposits' && (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Deposit ID</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Diterima</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tanggal</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.nokosDeposits.map(dep => (
                    <tr key={dep._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{dep.userId?.username}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{dep.depositId}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatRupiah(dep.diterima)}</td>
                      <td className="px-4 py-3"><StatusBadge s={dep.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(dep.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'premku-orders' && (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Produk</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Total</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tanggal</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.premkuOrders.map(o => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{o.userId?.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.productName}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand">{formatRupiah(o.total)}</td>
                      <td className="px-4 py-3"><StatusBadge s={o.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'nokos-orders' && (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Layanan</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Nomor</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">OTP</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Harga</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th><th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tgl</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.nokosOrders.map(o => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{o.userId?.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{o.serviceName} — {o.countryName}</td>
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">{o.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{o.otpCode || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatRupiah(o.price)}</td>
                      <td className="px-4 py-3"><StatusBadge s={o.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
