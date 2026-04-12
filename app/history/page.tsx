'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { History, ShoppingBag, Phone, CreditCard, RefreshCw, X, Copy } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

type Tab = 'premku-orders' | 'nokos-orders' | 'premku-deposits' | 'nokos-deposits';

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('premku-orders');
  const [data, setData] = useState<Record<string, unknown[]>>({ premkuOrders: [], nokosOrders: [], premkuDeposits: [], nokosDeposits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/history').then(r => r.json()).then(d => {
      if (d.success) setData({ premkuOrders: d.premkuOrders, nokosOrders: d.nokosOrders, premkuDeposits: d.premkuDeposits, nokosDeposits: d.nokosDeposits });
    }).finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      success: 'badge-success', completed: 'badge-success',
      pending: 'badge-pending', processing: 'badge-pending', active: 'badge-active',
      failed: 'badge-failed', canceled: 'badge-failed', cancel: 'badge-failed', expired: 'badge-failed', refunded: 'badge-pending',
      confirmed: 'badge-success',
    };
    return <span className={map[status] || 'badge-pending'}>{status}</span>;
  };

  const checkPremkuOrder = async (invoice: string) => {
    const res = await fetch('/api/premku/order-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice }),
    });
    const d = await res.json();
    if (d.success) {
      toast(`Status: ${d.order.status}`);
      setData(prev => ({
        ...prev,
        premkuOrders: (prev.premkuOrders as Record<string, unknown>[]).map((o: Record<string, unknown>) =>
          o.invoice === invoice ? { ...o, status: d.order.status, accounts: d.order.accounts } : o
        ),
      }));
    }
  };

  const checkNokosOrder = async (orderId: string) => {
    const res = await fetch('/api/nokos/order-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const d = await res.json();
    if (d.success) {
      if (d.order.otpCode) toast.success(`OTP: ${d.order.otpCode}`);
      else toast(`Status: ${d.order.status}`);
      setData(prev => ({
        ...prev,
        nokosOrders: (prev.nokosOrders as Record<string, unknown>[]).map((o: Record<string, unknown>) =>
          o.orderId === orderId ? { ...o, status: d.order.status, otpCode: d.order.otpCode } : o
        ),
      }));
    }
  };

  const cancelNokosOrder = async (orderId: string) => {
    if (!confirm('Batalkan pesanan ini?')) return;
    const res = await fetch('/api/nokos/order-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const d = await res.json();
    if (d.success) { toast.success(d.message); setData(prev => ({ ...prev, nokosOrders: (prev.nokosOrders as Record<string, unknown>[]).map((o: Record<string, unknown>) => o.orderId === orderId ? { ...o, status: 'canceled' } : o) })); }
    else toast.error(d.message);
  };

  const checkPremkuDeposit = async (invoice: string) => {
    const res = await fetch('/api/premku/deposit-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice }),
    });
    const d = await res.json();
    if (d.success) {
      toast(d.deposit.status === 'success' ? 'Pembayaran sukses!' : `Status: ${d.deposit.status}`);
      setData(prev => ({ ...prev, premkuDeposits: (prev.premkuDeposits as Record<string, unknown>[]).map((dep: Record<string, unknown>) => dep.invoice === invoice ? { ...dep, status: d.deposit.status } : dep) }));
    }
  };

  const cancelPremkuDeposit = async (invoice: string) => {
    if (!confirm('Batalkan deposit?')) return;
    const res = await fetch('/api/premku/deposit-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice }),
    });
    const d = await res.json();
    if (d.success) { toast.success('Deposit dibatalkan.'); setData(prev => ({ ...prev, premkuDeposits: (prev.premkuDeposits as Record<string, unknown>[]).map((dep: Record<string, unknown>) => dep.invoice === invoice ? { ...dep, status: 'canceled' } : dep) })); }
    else toast.error(d.message);
  };

  const checkNokosDeposit = async (depositId: string) => {
    const res = await fetch('/api/nokos/deposit-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId }),
    });
    const d = await res.json();
    if (d.success) { toast(d.deposit.status === 'success' ? 'Pembayaran sukses!' : `Status: ${d.deposit.status}`); }
  };

  const cancelNokosDeposit = async (depositId: string) => {
    if (!confirm('Batalkan deposit?')) return;
    const res = await fetch('/api/nokos/deposit-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId }),
    });
    const d = await res.json();
    if (d.success) toast.success('Deposit dibatalkan.'); else toast.error(d.message);
  };

  const tabs: { id: Tab; label: string; icon: React.FC<{ size: number }> }[] = [
    { id: 'premku-orders', label: 'Order Premku', icon: ShoppingBag },
    { id: 'nokos-orders', label: 'Order Nokos', icon: Phone },
    { id: 'premku-deposits', label: 'Deposit Premku', icon: CreditCard },
    { id: 'nokos-deposits', label: 'Deposit Nokos', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <History size={22} className="text-brand" />
          <h1 className="section-title">Riwayat Transaksi</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                tab === id ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
        ) : (
          <>
            {/* Premku Orders */}
            {tab === 'premku-orders' && (
              <div className="space-y-3">
                {(data.premkuOrders as Record<string, unknown>[]).length === 0 ? (
                  <div className="card text-center py-10 text-gray-400">Belum ada order Premku</div>
                ) : (data.premkuOrders as Record<string, unknown>[]).map((o) => (
                  <div key={o._id as string} className="card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{o.productName as string}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{o.invoice as string}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StatusBadge status={o.status as string} />
                          <span className="text-xs text-gray-500">{fmtDate(o.createdAt as string)}</span>
                          <span className="text-xs font-semibold text-brand">{formatRupiah(o.total as number)}</span>
                        </div>
                        {o.status === 'success' && (o.accounts as { username: string; password: string }[])?.length > 0 && (
                          <div className="mt-2 bg-green-50 rounded-lg p-2.5 space-y-1">
                            {(o.accounts as { username: string; password: string }[]).map((acc, i) => (
                              <div key={i} className="text-xs font-mono flex items-center justify-between gap-2">
                                <span>{acc.username} / {acc.password}</span>
                                <button onClick={() => { navigator.clipboard.writeText(`${acc.username} / ${acc.password}`); toast.success('Disalin!'); }}>
                                  <Copy size={11} className="text-gray-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => checkPremkuOrder(o.invoice as string)}
                        className="text-xs flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-600 transition-colors flex-shrink-0">
                        <RefreshCw size={11} />Cek
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nokos Orders */}
            {tab === 'nokos-orders' && (
              <div className="space-y-3">
                {(data.nokosOrders as Record<string, unknown>[]).length === 0 ? (
                  <div className="card text-center py-10 text-gray-400">Belum ada order Nokos</div>
                ) : (data.nokosOrders as Record<string, unknown>[]).map((o) => (
                  <div key={o._id as string} className="card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{o.serviceName as string} — {o.countryName as string}</p>
                        <p className="font-mono text-blue-600 font-bold text-sm mt-0.5">{o.phoneNumber as string}</p>
                        {o.otpCode && <p className="text-green-600 font-bold font-mono text-lg mt-1">OTP: {o.otpCode as string}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StatusBadge status={o.status as string} />
                          <span className="text-xs text-gray-500">{fmtDate(o.createdAt as string)}</span>
                          <span className="text-xs font-semibold text-blue-600">{formatRupiah(o.price as number)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={() => checkNokosOrder(o.orderId as string)}
                          className="text-xs flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-blue-600 transition-colors">
                          <RefreshCw size={11} />Cek
                        </button>
                        {o.status === 'active' && (
                          <button onClick={() => cancelNokosOrder(o.orderId as string)}
                            className="text-xs flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-red-600 transition-colors">
                            <X size={11} />Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Premku Deposits */}
            {tab === 'premku-deposits' && (
              <div className="space-y-3">
                {(data.premkuDeposits as Record<string, unknown>[]).length === 0 ? (
                  <div className="card text-center py-10 text-gray-400">Belum ada deposit Premku</div>
                ) : (data.premkuDeposits as Record<string, unknown>[]).map((d) => (
                  <div key={d._id as string} className="card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">Deposit Premku</p>
                        <p className="text-xs font-mono text-gray-400">{d.invoice as string}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StatusBadge status={d.status as string} />
                          <span className="text-xs text-gray-500">{fmtDate(d.createdAt as string)}</span>
                          <span className="text-xs font-bold text-brand">{formatRupiah(d.amount as number)}</span>
                          {(d.kodeUnik as number) > 0 && <span className="text-xs text-gray-500">+{d.kodeUnik as number}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={() => checkPremkuDeposit(d.invoice as string)}
                          className="text-xs flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-600 transition-colors">
                          <RefreshCw size={11} />Cek
                        </button>
                        {d.status === 'pending' && (
                          <button onClick={() => cancelPremkuDeposit(d.invoice as string)} className="btn-danger text-xs px-2.5 py-1.5">
                            <X size={11} />Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nokos Deposits */}
            {tab === 'nokos-deposits' && (
              <div className="space-y-3">
                {(data.nokosDeposits as Record<string, unknown>[]).length === 0 ? (
                  <div className="card text-center py-10 text-gray-400">Belum ada deposit Nokos</div>
                ) : (data.nokosDeposits as Record<string, unknown>[]).map((d) => (
                  <div key={d._id as string} className="card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">Deposit Nokos</p>
                        <p className="text-xs font-mono text-gray-400">{d.depositId as string}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StatusBadge status={d.status as string} />
                          <span className="text-xs text-gray-500">{fmtDate(d.createdAt as string)}</span>
                          <span className="text-xs font-bold text-blue-600">{formatRupiah(d.diterima as number)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={() => checkNokosDeposit(d.depositId as string)}
                          className="text-xs flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg text-gray-600 transition-colors">
                          <RefreshCw size={11} />Cek
                        </button>
                        {d.status === 'pending' && (
                          <button onClick={() => cancelNokosDeposit(d.depositId as string)} className="btn-danger text-xs px-2.5 py-1.5">
                            <X size={11} />Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
