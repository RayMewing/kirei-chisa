'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { CreditCard, ShoppingBag, Phone, RefreshCw, X, Copy } from 'lucide-react';
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

  const presets = [10000, 25000, 50000, 100000, 200000, 500000];

  const handleDeposit = async () => {
    const num = parseInt(amount);
    if (!num || num < 10000) { toast.error('Minimum deposit Rp10.000'); return; }
    setLoading(true);
    try {
      const endpoint = depType === 'premku' ? '/api/premku/deposit' : '/api/nokos/deposit';
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }

      const dep = depType === 'premku' ? data.deposit : data.deposit;
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
      toast.success('Deposit dibuat! Scan QR untuk membayar.');
    } finally { setLoading(false); }
  };

  const handleCheckStatus = async () => {
    if (!result) return;
    setCheckLoading(true);
    try {
      let res, data;
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
      data = await res.json();
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
      if (data.success) { toast.success('Deposit dibatalkan.'); setResult(null); setAmount(''); }
      else toast.error(data.message);
    } catch { toast.error('Gagal membatalkan.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <CreditCard size={22} className="text-brand" />
          <h1 className="section-title">Deposit Saldo</h1>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['premku', 'nokos'] as DepType[]).map(t => (
            <button key={t} onClick={() => { setDepType(t); setResult(null); setAmount(''); }}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                depType === t ? t === 'premku' ? 'border-brand bg-brand/5' : 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              {t === 'premku' ? <ShoppingBag size={22} className={depType === t ? 'text-brand' : 'text-gray-400'} />
                : <Phone size={22} className={depType === t ? 'text-blue-600' : 'text-gray-400'} />}
              <div className="text-left">
                <p className={`font-bold text-sm ${depType === t ? t === 'premku' ? 'text-brand' : 'text-blue-700' : 'text-gray-600'}`}>
                  {t === 'premku' ? 'Premku' : 'Nokos'}
                </p>
                <p className="text-xs text-gray-500">{t === 'premku' ? 'Akun Premium' : 'OTP Virtual'}</p>
              </div>
            </button>
          ))}
        </div>

        {!result ? (
          <div className="card shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Jumlah Deposit</h2>
            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(String(p))}
                  className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                    amount === String(p) ? 'bg-brand text-white border-brand' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand/40'
                  }`}>
                  {formatRupiah(p)}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="label">Atau masukkan nominal</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input type="number" className="input pl-10" placeholder="10000" min={10000} max={5000000}
                  value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Min. Rp10.000 • Max. Rp5.000.000</p>
            </div>

            <button onClick={handleDeposit} disabled={loading || !amount}
              className={`btn-primary w-full py-3 ${depType === 'nokos' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
              {loading ? <span className="spinner" /> : `Buat Deposit ${depType === 'premku' ? 'Premku' : 'Nokos'}`}
            </button>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Detail Deposit</h2>
              {result.status === 'success' && <span className="badge-success">Sukses ✓</span>}
              {result.status === 'pending' && <span className="badge-pending">Menunggu</span>}
              {(result.status === 'canceled' || result.status === 'cancel') && <span className="badge-failed">Dibatalkan</span>}
            </div>

            {/* QR Code */}
            {result.qrImage && result.status === 'pending' && (
              <div className="text-center mb-4">
                <Image src={result.qrImage} alt="QR Code" width={220} height={220} className="mx-auto rounded-xl border" />
                {result.qrRaw && (
                  <button onClick={() => { navigator.clipboard.writeText(result.qrRaw!); toast.success('QR string disalin!'); }}
                    className="text-xs text-gray-500 mt-2 hover:text-brand flex items-center gap-1 mx-auto">
                    <Copy size={11} /> Salin kode QR
                  </button>
                )}
              </div>
            )}

            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tipe</span><span className="font-medium capitalize">{result.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Nominal</span><span className="font-medium">{formatRupiah(result.amount)}</span></div>
              {result.kodeUnik && <div className="flex justify-between"><span className="text-gray-500">Kode Unik</span><span className="font-medium text-brand">+{result.kodeUnik}</span></div>}
              {result.totalBayar && <div className="flex justify-between border-t pt-2"><span className="text-gray-700 font-semibold">Total Bayar</span><span className="font-bold text-brand">{formatRupiah(result.totalBayar)}</span></div>}
              {result.fee && <div className="flex justify-between"><span className="text-gray-500">Fee</span><span className="font-medium">{formatRupiah(result.fee)}</span></div>}
              {result.diterima && <div className="flex justify-between"><span className="text-gray-500">Diterima</span><span className="font-medium text-green-600">{formatRupiah(result.diterima)}</span></div>}
            </div>

            {result.status === 'pending' && (
              <>
                <p className="text-xs text-center text-gray-400 mb-3">Bayar via QRIS sebelum waktu habis</p>
                <div className="flex gap-2">
                  <button onClick={handleCheckStatus} disabled={checkLoading} className="btn-primary flex-1 py-2.5 text-sm">
                    {checkLoading ? <span className="spinner" /> : <><RefreshCw size={14} />Cek Status</>}
                  </button>
                  <button onClick={handleCancel} className="btn-danger px-4 py-2.5">
                    <X size={14} />Cancel
                  </button>
                </div>
              </>
            )}

            {(result.status === 'success' || result.status === 'canceled' || result.status === 'cancel') && (
              <button onClick={() => { setResult(null); setAmount(''); }} className="btn-secondary w-full py-2.5 text-sm">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner spinner-brand scale-150" /></div>}>
      <DepositContent />
    </Suspense>
  );
}
