'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { CreditCard, ShoppingBag, Phone, RefreshCw, X, Copy, Zap, TerminalSquare } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

type DepType = 'premku' | 'nokos';

interface DepositResult {
  type: DepType;
  invoice?: string; depositId?: string;
  amount: number; totalBayar?: number; kodeUnik?: number;
  fee?: number; diterima?: number;
  qrImage?: string; qrString?: string; qrRaw?: string;
  status: string; expiredAt?: string; expiredIn?: string;
}

function DepositContent() {
  const params = useSearchParams();
  const [depType, setDepType] = useState<DepType>((params.get('type') as DepType) || 'premku');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [result, setResult] = useState<DepositResult | null>(null);

  const presets = [1000, 5000, 10000, 25000, 50000, 100000];

  const handleDeposit = async () => {
    const num = parseInt(amount);
    if (!num || num < 1000) { toast.error('Minimum deposit Rp1.000'); return; }
    setLoading(true);
    try {
      const endpoint = depType === 'premku' ? '/api/premku/deposit' : '/api/nokos/deposit';
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }

      const dep = data.deposit;
      setResult({
        type: depType,
        invoice: dep.invoice,
        depositId: dep.depositId,
        amount: dep.amount,
        totalBayar: dep.totalBayar,
        kodeUnik: dep.kodeUnik,
        fee: dep.fee,
        diterima: dep.diterima,
        qrImage: dep.qrImage,
        qrString: dep.qrString,
        qrRaw: dep.qrRaw,
        status: 'pending',
        expiredIn: dep.expiredIn,
        expiredAt: dep.expiredAt,
      });
      toast.success('Deposit berhasil dibuat. Scan QR untuk membayar.');
    } finally { setLoading(false); }
  };

  const handleCheckStatus = async () => {
    if (!result) return;
    setCheckLoading(true);
    try {
      let res;
      if (result.type === 'premku') {
        res = await fetch('/api/premku/deposit-status', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice: result.invoice }),
        });
      } else {
        res = await fetch('/api/nokos/deposit-status', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depositId: result.depositId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        const dep = data.deposit;
        setResult(prev => prev ? { ...prev, status: dep.status, qrImage: dep.qrImage || prev.qrImage } : prev);
        if (dep.status === 'success') toast.success('Pembayaran berhasil! Saldo sudah ditambahkan.');
        else if (dep.status === 'canceled' || dep.status === 'cancel') toast('Deposit dibatalkan.');
        else toast('Pembayaran belum terdeteksi. Coba lagi.');
      }
    } finally { setCheckLoading(false); }
  };

  const handleCancel = async () => {
    if (!result || !confirm('Batalkan deposit ini?')) return;
    try {
      let res;
      if (result.type === 'premku') {
        res = await fetch('/api/premku/deposit-cancel', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice: result.invoice }),
        });
      } else {
        res = await fetch('/api/nokos/deposit-cancel', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ depositId: result.depositId }),
        });
      }
      const data = await res.json();
      if (data.success) { toast.success('Deposit berhasil dibatalkan.'); setResult(null); setAmount(''); }
      else toast.error(data.message);
    } catch { toast.error('Gagal membatalkan deposit.'); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* Header */}
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <Zap className="text-red-500" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Deposit Saldo
            </h1>
          </div>
          <p className="text-zinc-500 font-mono text-xs pl-10">{'>>'} Isi saldo untuk mulai berbelanja</p>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(['premku', 'nokos'] as DepType[]).map(t => (
            <button key={t} onClick={() => { setDepType(t); setResult(null); setAmount(''); }}
              className={`p-4 border-2 relative overflow-hidden flex items-center justify-center sm:justify-start gap-3 transition-all group ${
                depType === t
                  ? t === 'premku' ? 'border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}>
              {depType === t && <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />}
              {t === 'premku' ? (
                <ShoppingBag size={22} className={`relative z-10 ${depType === t ? 'text-red-500' : 'text-zinc-600'}`} />
              ) : (
                <Phone size={22} className={`relative z-10 ${depType === t ? 'text-white' : 'text-zinc-600'}`} />
              )}
              <div className="text-left relative z-10 hidden sm:block">
                <p className={`font-mono font-bold text-sm uppercase tracking-wider ${depType === t ? t === 'premku' ? 'text-red-500' : 'text-white' : 'text-zinc-500'}`}>
                  {t === 'premku' ? 'Premku' : 'Nokos OTP'}
                </p>
                <p className="text-[10px] font-mono text-zinc-500 tracking-widest">{t === 'premku' ? 'Akun Premium' : 'OTP Virtual'}</p>
              </div>
            </button>
          ))}
        </div>

        {!result ? (
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 relative">
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-600" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-600" />

            <h2 className="font-bold font-mono text-white mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
              <TerminalSquare size={16} className="text-zinc-500" />
              Pilih Nominal
            </h2>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(String(p))}
                  className={`py-3 text-xs font-mono font-bold uppercase tracking-widest border transition-all ${
                    amount === String(p)
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-red-500/50 hover:text-red-400'
                  }`}>
                  {formatRupiah(p)}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest">{'>>'} Nominal Lain</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm font-bold">Rp</span>
                <input type="number" className="input pl-11 bg-zinc-950 text-white font-mono text-lg font-bold border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                  placeholder="1000" min={1000} max={5000000}
                  value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <p className="text-[10px] font-mono text-zinc-500 mt-2">Min. Rp1.000 — Maks. Rp5.000.000</p>
            </div>

            <button onClick={handleDeposit} disabled={loading || !amount}
              className={`w-full py-4 text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                loading || !amount
                  ? 'bg-zinc-950 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : depType === 'nokos'
                    ? 'bg-white border border-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-red-600 border border-red-500 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
              }`}>
              {loading
                ? <span className={`spinner ${depType === 'nokos' ? 'border-zinc-900/30 border-t-zinc-900' : 'border-white/30 border-t-white'}`} />
                : `Buat Deposit ${depType === 'premku' ? 'Premku' : 'Nokos'}`
              }
            </button>
          </div>
        ) : (
          <div className={`bg-zinc-900 border p-6 relative ${result.type === 'premku' ? 'border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-zinc-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]'}`}>
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${result.type === 'premku' ? 'border-red-500' : 'border-white'}`} />
            <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${result.type === 'premku' ? 'border-red-500' : 'border-white'}`} />

            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
              <h2 className="font-black font-mono text-white uppercase tracking-widest">Detail Deposit</h2>
              {result.status === 'success' && <span className="badge-success">Berhasil</span>}
              {result.status === 'pending' && <span className="badge-pending animate-pulse">Menunggu</span>}
              {(result.status === 'canceled' || result.status === 'cancel') && <span className="badge-failed">Dibatalkan</span>}
            </div>

            {/* QR Code */}
            {result.qrImage && result.status === 'pending' && (
              <div className="text-center mb-6 relative w-fit mx-auto group">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white p-2 border-4 border-zinc-800 group-hover:border-red-500 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.qrImage} alt="QR Code" width={220} height={220} className="mx-auto" />
                </div>
                {result.qrRaw && (
                  <button onClick={() => { navigator.clipboard.writeText(result.qrRaw!); toast.success('String QR disalin!'); }}
                    className="text-xs font-mono text-zinc-400 mt-4 hover:text-white flex items-center justify-center gap-2 mx-auto uppercase bg-zinc-950 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 transition-all">
                    <Copy size={12} /> Salin Kode QR
                  </button>
                )}
              </div>
            )}

            {/* Details */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 uppercase">Tipe</span>
                <span className="font-bold text-white uppercase">{result.type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 uppercase">Nominal</span>
                <span className="font-bold text-zinc-300">{formatRupiah(result.amount)}</span>
              </div>
              {result.kodeUnik ? <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 uppercase">Kode Unik</span>
                <span className="font-bold text-red-500">+{result.kodeUnik}</span>
              </div> : null}
              {result.fee ? <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 uppercase">Biaya Admin</span>
                <span className="font-medium text-zinc-400">{formatRupiah(result.fee)}</span>
              </div> : null}
              {result.totalBayar ? <div className="flex justify-between items-center pt-2">
                <span className="text-zinc-300 font-black uppercase">Total Bayar</span>
                <span className="font-black text-red-500 text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(result.totalBayar)}</span>
              </div> : null}
              {result.diterima ? <div className="flex justify-between items-center mt-2 bg-emerald-950/20 border border-emerald-900/50 p-2">
                <span className="text-emerald-600/70 uppercase font-bold">Saldo Diterima</span>
                <span className="font-black text-emerald-400 text-sm">{formatRupiah(result.diterima)}</span>
              </div> : null}
            </div>

            {result.status === 'pending' && (
              <>
                <p className="text-[10px] font-mono text-center text-amber-500/80 mb-4 uppercase tracking-widest border border-amber-900/30 bg-amber-950/20 py-2">
                  <span className="animate-pulse mr-2">⚠️</span> Bayar via QRIS sebelum waktu habis
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleCheckStatus} disabled={checkLoading} className="btn-secondary flex-1 py-3 text-xs">
                    {checkLoading ? <span className="spinner border-red-500/30 border-t-red-500" /> : <><RefreshCw size={14} /> Cek Status</>}
                  </button>
                  <button onClick={handleCancel} className="btn-danger sm:px-6 py-3 text-xs">
                    <X size={14} /> Batalkan
                  </button>
                </div>
              </>
            )}

            {(result.status === 'success' || result.status === 'canceled' || result.status === 'cancel') && (
              <button onClick={() => { setResult(null); setAmount(''); }}
                className="w-full py-3 bg-zinc-950 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-all font-mono text-xs uppercase tracking-widest font-bold">
                Buat Deposit Baru
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 animate-pulse rounded-full" />
          <div className="spinner border-[3px] border-zinc-800 border-t-red-600 w-12 h-12 relative z-10" />
        </div>
        <p className="font-mono text-red-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Memuat...</p>
      </div>
    }>
      <DepositContent />
    </Suspense>
  );
}
