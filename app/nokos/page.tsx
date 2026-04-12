'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Phone, Search, RefreshCw, X, Copy, ChevronRight, AlertCircle } from 'lucide-react';

interface Service { service_code: number; service_name: string; service_img: string; }
interface Pricelist { provider_id: string; server_id: number; stock: number; rate: number; price: number; price_format: string; available: boolean; }
interface Country { number_id: number; name: string; img: string; prefix: string; iso_code: string; rate: number; stock_total: number; pricelist: Pricelist[]; }
interface Operator { id: number; name: string; image: string; }
interface ActiveOrder {
  id: string; orderId: string; phoneNumber: string; serviceName: string; serviceImg: string;
  countryName: string; operatorName: string; price: number; status: string;
  otpCode: string | null; otpMsg: string | null; expiresAt: string; cancelAllowedAt: string; canCancel: boolean;
}

type Step = 'service' | 'country' | 'operator' | 'confirm';

export default function NokosPage() {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPricelist, setSelectedPricelist] = useState<Pricelist | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // Check maintenance
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 3600000);
      const h = wib.getUTCHours(), m = wib.getUTCMinutes();
      const mins = h * 60 + m;
      setIsMaintenance(mins >= 23 * 60 + 20 || mins <= 25);
    };
    check(); const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/nokos/services').then(r => r.json()).then(d => {
      if (d.success) setServices(d.services);
    }).finally(() => setLoading(false));
  }, []);

  const selectService = async (svc: Service) => {
    setSelectedService(svc); setSearch('');
    setLoading(true);
    try {
      const res = await fetch(`/api/nokos/countries?service_id=${svc.service_code}`);
      const data = await res.json();
      if (data.success) setCountries(data.countries);
      setStep('country');
    } finally { setLoading(false); }
  };

  const selectCountry = async (country: Country, pricelist: Pricelist) => {
    setSelectedCountry(country); setSelectedPricelist(pricelist); setSearch('');
    setLoading(true);
    try {
      const res = await fetch(`/api/nokos/operators?country=${encodeURIComponent(country.name.toLowerCase())}&provider_id=${pricelist.provider_id}`);
      const data = await res.json();
      if (data.success) setOperators(data.operators);
      setStep('operator');
    } finally { setLoading(false); }
  };

  const selectOperator = (op: Operator) => {
    setSelectedOperator(op); setStep('confirm');
  };

  const handleOrder = async () => {
    if (!selectedService || !selectedCountry || !selectedPricelist || !selectedOperator) return;
    setOrdering(true);
    try {
      const res = await fetch('/api/nokos/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberId: selectedCountry.number_id,
          providerId: selectedPricelist.provider_id,
          operatorId: selectedOperator.id,
          serviceCode: selectedService.service_code,
          serviceName: selectedService.service_name,
          serviceImg: selectedService.service_img,
          countryName: selectedCountry.name,
          countryFlag: selectedCountry.img,
          operatorName: selectedOperator.name,
          price: selectedPricelist.price,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) { toast.error('Login dulu ya!'); return; }
        toast.error(data.message); return;
      }
      toast.success('Pesanan berhasil! Menunggu OTP...');
      setActiveOrder(data.order);
      setStep('service');
      setSelectedService(null); setSelectedCountry(null); setSelectedPricelist(null); setSelectedOperator(null);
    } finally { setOrdering(false); }
  };

  const handleCheckStatus = async () => {
    if (!activeOrder) return;
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/nokos/order-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: activeOrder.orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        if (data.order.status === 'completed') toast.success('OTP berhasil diterima!');
        else if (data.order.status === 'expired' || data.order.status === 'refunded')
          toast('Pesanan expired. Saldo dikembalikan.');
      }
    } finally { setCheckingStatus(false); }
  };

  const handleCancel = async () => {
    if (!activeOrder) return;
    if (!confirm('Batalkan pesanan ini? Saldo akan dikembalikan.')) return;
    try {
      const res = await fetch('/api/nokos/order-cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: activeOrder.orderId }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); setActiveOrder(null); }
      else toast.error(data.message);
    } catch { toast.error('Gagal membatalkan pesanan.'); }
  };

  const filteredServices = services.filter(s => s.service_name.toLowerCase().includes(search.toLowerCase()));
  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 flex-wrap">
      {[
        { label: 'Aplikasi', active: step === 'service', onClick: () => { setStep('service'); setSelectedService(null); } },
        ...(selectedService ? [{ label: selectedService.service_name, active: step === 'country', onClick: () => { setStep('country'); setSelectedCountry(null); } }] : []),
        ...(selectedCountry ? [{ label: selectedCountry.name, active: step === 'operator', onClick: () => { setStep('operator'); setSelectedOperator(null); } }] : []),
        ...(selectedOperator ? [{ label: selectedOperator.name, active: step === 'confirm', onClick: () => {} }] : []),
      ].map((item, i, arr) => (
        <span key={i} className="flex items-center gap-1.5">
          <button onClick={item.onClick} className={`${item.active ? 'text-brand font-semibold' : 'hover:text-gray-700'}`}>{item.label}</button>
          {i < arr.length - 1 && <ChevronRight size={12} />}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Phone size={22} className="text-blue-600" />
          <div>
            <h1 className="section-title">Nokos — OTP Virtual</h1>
            <p className="text-sm text-gray-500">Nomor virtual untuk verifikasi OTP berbagai aplikasi</p>
          </div>
        </div>

        {/* Maintenance Banner */}
        {isMaintenance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700 font-medium">
              Layanan Nokos sedang maintenance (23:20 – 00:25 WIB). Pembelian tidak tersedia.
            </p>
          </div>
        )}

        {/* Active Order Panel */}
        {activeOrder && (
          <div className={`card mb-6 border-2 ${
            activeOrder.status === 'completed' ? 'border-green-200 bg-green-50' :
            activeOrder.status === 'active' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {activeOrder.serviceImg && (
                  <Image src={activeOrder.serviceImg} alt={activeOrder.serviceName} width={24} height={24} className="rounded" />
                )}
                <span className="font-bold text-gray-900">Pesanan Aktif</span>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div><span className="text-gray-500">Nomor:</span><p className="font-mono font-semibold text-gray-900">{activeOrder.phoneNumber}</p></div>
              <div><span className="text-gray-500">Layanan:</span><p className="font-medium">{activeOrder.serviceName}</p></div>
              <div><span className="text-gray-500">Negara:</span><p className="font-medium">{activeOrder.countryName}</p></div>
              <div><span className="text-gray-500">Operator:</span><p className="font-medium capitalize">{activeOrder.operatorName}</p></div>
            </div>

            {activeOrder.status === 'active' && (
              <div className="flex items-center justify-between mb-3 bg-white/60 rounded-lg px-3 py-2">
                <CountdownTimer expiresAt={activeOrder.expiresAt} label="Waktu tunggu OTP" onExpire={handleCheckStatus} />
              </div>
            )}

            {activeOrder.otpCode && (
              <div className="bg-white rounded-xl p-3 mb-3 border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Kode OTP</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600 font-mono tracking-wider">{activeOrder.otpCode}</span>
                  <button onClick={() => { navigator.clipboard.writeText(activeOrder.otpCode!); toast.success('OTP disalin!'); }}>
                    <Copy size={16} className="text-gray-400 hover:text-brand" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleCheckStatus} disabled={checkingStatus} className="btn-secondary flex-1 py-2 text-sm">
                {checkingStatus ? <span className="spinner spinner-brand" /> : <><RefreshCw size={13} />Cek Status</>}
              </button>
              {activeOrder.canCancel && activeOrder.status === 'active' && (
                <button onClick={handleCancel} className="btn-danger flex-1 py-2">
                  <X size={13} />Cancel & Refund
                </button>
              )}
            </div>
          </div>
        )}

        <Breadcrumb />

        {/* Search */}
        {(step === 'service' || step === 'country') && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 bg-white" placeholder={step === 'service' ? 'Cari aplikasi...' : 'Cari negara...'}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : step === 'service' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredServices.map(svc => (
              <button key={svc.service_code} onClick={() => selectService(svc)} disabled={isMaintenance}
                className="card flex flex-col items-center gap-2 py-4 hover:border-blue-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Image src={svc.service_img} alt={svc.service_name} width={36} height={36} className="rounded-lg" />
                <span className="text-sm font-medium text-gray-800 text-center">{svc.service_name}</span>
              </button>
            ))}
          </div>
        ) : step === 'country' ? (
          <div className="space-y-2">
            {filteredCountries.map(country => (
              country.pricelist.filter(p => p.available).map(pl => (
                <button key={`${country.number_id}-${pl.provider_id}`} onClick={() => selectCountry(country, pl)}
                  className="w-full card flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all text-left">
                  <Image src={country.img} alt={country.name} width={28} height={20} className="rounded object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{country.name} <span className="text-gray-500 text-xs">{country.prefix}</span></p>
                    <p className="text-xs text-gray-500">Stok: {pl.stock}</p>
                  </div>
                  <span className="font-bold text-blue-600 text-sm flex-shrink-0">{pl.price_format}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))
            ))}
          </div>
        ) : step === 'operator' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {operators.map(op => (
              <button key={op.id} onClick={() => selectOperator(op)}
                className="card flex flex-col items-center gap-2 py-4 hover:border-blue-300 hover:shadow-md transition-all capitalize">
                {op.image ? (
                  <Image src={op.image} alt={op.name} width={36} height={36} className="rounded-lg object-contain" />
                ) : (
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800">{op.name}</span>
              </button>
            ))}
          </div>
        ) : step === 'confirm' && selectedService && selectedCountry && selectedPricelist && selectedOperator ? (
          <div className="max-w-sm mx-auto card border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Konfirmasi Pesanan</h3>
            <div className="space-y-3 text-sm mb-5">
              {[
                { label: 'Aplikasi', value: selectedService.service_name },
                { label: 'Negara', value: selectedCountry.name },
                { label: 'Operator', value: selectedOperator.name, cls: 'capitalize' },
                { label: 'Harga', value: selectedPricelist.price_format, cls: 'font-bold text-blue-600' },
                { label: 'Waktu', value: '20 menit (auto-refund jika OTP tidak masuk)' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-medium text-gray-900 ${cls || ''}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 mb-4">
              💡 Cancel tersedia 3 menit setelah order. Jika OTP tidak masuk dalam 20 menit, saldo otomatis dikembalikan.
            </div>
            <button onClick={handleOrder} disabled={ordering || isMaintenance} className="btn-primary w-full py-3 bg-blue-600 hover:bg-blue-700">
              {ordering ? <span className="spinner" /> : 'Pesan Sekarang'}
            </button>
            <button onClick={() => { setStep('operator'); setSelectedOperator(null); }} className="btn-secondary w-full mt-2 py-2.5 text-sm">
              ← Kembali
            </button>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
