'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Phone, Search, RefreshCw, X, Copy, ChevronRight, AlertCircle, Crosshair, TerminalSquare } from 'lucide-react';

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
        if (res.status === 401) { toast.error('System Auth Failed: Login Required'); return; }
        toast.error(data.message); return;
      }
      toast.success('Initialize Success! Awaiting Data...');
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
        if (data.order.status === 'completed') toast.success('Data Decrypted: OTP Received!');
        else if (data.order.status === 'expired' || data.order.status === 'refunded')
          toast('Session Expired. Credits Refunded.');
      }
    } finally { setCheckingStatus(false); }
  };

  const handleCancel = async () => {
    if (!activeOrder) return;
    if (!confirm('Abort operation? Credits will be refunded.')) return;
    try {
      const res = await fetch('/api/nokos/order-cancel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: activeOrder.orderId }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Process Aborted.'); setActiveOrder(null); }
      else toast.error(data.message);
    } catch { toast.error('Failed to abort operation.'); }
  };

  const filteredServices = services.filter(s => s.service_name.toLowerCase().includes(search.toLowerCase()));
  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6 flex-wrap uppercase tracking-wider bg-zinc-950/50 p-2 border-l-2 border-red-600">
      <TerminalSquare size={14} className="text-red-500" />
      {[
        { label: 'System', active: step === 'service', onClick: () => { setStep('service'); setSelectedService(null); } },
        ...(selectedService ? [{ label: selectedService.service_name, active: step === 'country', onClick: () => { setStep('country'); setSelectedCountry(null); } }] : []),
        ...(selectedCountry ? [{ label: selectedCountry.name, active: step === 'operator', onClick: () => { setStep('operator'); setSelectedOperator(null); } }] : []),
        ...(selectedOperator ? [{ label: selectedOperator.name, active: step === 'confirm', onClick: () => {} }] : []),
      ].map((item, i, arr) => (
        <span key={i} className="flex items-center gap-2">
          <button onClick={item.onClick} className={`${item.active ? 'text-red-500 font-bold drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'hover:text-zinc-300'} transition-colors`}>
            {item.label}
          </button>
          {i < arr.length - 1 && <span className="text-red-900">{'//'}</span>}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Background Glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      <Navbar />
      <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Header Title */}
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <Crosshair className="text-red-500 animate-[spin_4s_linear_infinite]" size={28} />
            <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Nokos_OTP
            </h1>
          </div>
          <p className="text-red-500 font-mono text-xs pl-10">{'>>'} Virtual node for auth bypass_</p>
        </div>

        {/* Maintenance Banner */}
        {isMaintenance && (
          <div className="bg-amber-950/30 border-l-4 border-amber-500 p-4 mb-6 flex items-start gap-3 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-500 font-bold font-mono uppercase tracking-wide">System Maintenance</p>
              <p className="text-xs text-amber-600/80 font-mono mt-1">Node routing is offline (23:20 – 00:25 WIB). Transactions suspended.</p>
            </div>
          </div>
        )}

        {/* Active Order Panel - Mecha Style */}
        {activeOrder && (
          <div className={`card mb-8 border-l-4 relative overflow-hidden ${
            activeOrder.status === 'completed' ? 'border-emerald-500 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
            activeOrder.status === 'active' ? 'border-red-500 bg-red-950/10 shadow-[0_0_20px_rgba(220,38,38,0.15)]' : 'border-zinc-500 bg-zinc-900'
          }`}>
            {/* Scanlines on Active Order */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${activeOrder.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="font-bold text-white font-mono uppercase tracking-wide text-sm">Active_Session</span>
                </div>
                <button onClick={() => setActiveOrder(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
                <div><span className="text-zinc-500 block mb-1">Target_Number:</span><p className="font-bold text-red-400 text-sm tracking-wider">{activeOrder.phoneNumber}</p></div>
                <div><span className="text-zinc-500 block mb-1">Service:</span><div className="flex items-center gap-2 text-white"><Image src={activeOrder.serviceImg} alt="" width={16} height={16} className="rounded-sm" />{activeOrder.serviceName}</div></div>
                <div><span className="text-zinc-500 block mb-1">Region:</span><p className="text-white">{activeOrder.countryName}</p></div>
                <div><span className="text-zinc-500 block mb-1">Provider:</span><p className="text-white capitalize">{activeOrder.operatorName}</p></div>
              </div>

              {activeOrder.status === 'active' && (
                <div className="flex items-center justify-between mb-4 bg-zinc-950/80 border border-red-900/30 px-4 py-3">
                  <CountdownTimer expiresAt={activeOrder.expiresAt} label="Awaiting Decryption" onExpire={handleCheckStatus} />
                </div>
              )}

              {activeOrder.otpCode && (
                <div className="bg-zinc-950 border border-emerald-500/30 p-4 mb-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                  <p className="text-xs text-emerald-600/70 font-mono mb-2 uppercase tracking-widest">[ DECRYPTED_KEY ]</p>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-3xl font-black text-emerald-400 font-mono tracking-[0.2em]">{activeOrder.otpCode}</span>
                    <button onClick={() => { navigator.clipboard.writeText(activeOrder.otpCode!); toast.success('Key copied to clipboard'); }}
                      className="bg-emerald-950/50 p-2 border border-emerald-900 hover:border-emerald-500 transition-all">
                      <Copy size={18} className="text-emerald-500" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCheckStatus} disabled={checkingStatus} className="btn-secondary flex-1 py-2.5 text-xs">
                  {checkingStatus ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} /> : <><RefreshCw size={14} /> Ping_Status</>}
                </button>
                {activeOrder.canCancel && activeOrder.status === 'active' && (
                  <button onClick={handleCancel} className="btn-danger flex-1 py-2.5 text-xs">
                    <X size={14} /> Abort_Operation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <Breadcrumb />

        {/* Search */}
        {(step === 'service' || step === 'country') && (
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10"></div>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
            <input className="input pl-11 bg-zinc-950/80 backdrop-blur-sm border-zinc-800/80 focus:border-red-600 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white" 
              placeholder={step === 'service' ? 'Search module...' : 'Search region...'}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {/* Lists Container */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-zinc-900/50 border-zinc-800" />)}
          </div>
        ) : step === 'service' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredServices.map(svc => (
              <button key={svc.service_code} onClick={() => selectService(svc)} disabled={isMaintenance}
                className="card-product flex flex-col items-center justify-center gap-3 py-6 disabled:opacity-30 disabled:cursor-not-allowed group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Image src={svc.service_img} alt={svc.service_name} width={42} height={42} className="rounded shadow-lg relative z-10 grayscale-[30%] group-hover:grayscale-0 transition-all" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide text-center">{svc.service_name}</span>
              </button>
            ))}
          </div>
        ) : step === 'country' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCountries.map(country => (
              country.pricelist.filter(p => p.available).map(pl => (
                <button key={`${country.number_id}-${pl.provider_id}`} onClick={() => selectCountry(country, pl)}
                  className="w-full card bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80 hover:border-red-500/50 flex items-center justify-between gap-3 p-4 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="relative border border-zinc-700 p-0.5">
                      <Image src={country.img} alt={country.name} width={32} height={24} className="object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-mono font-bold text-zinc-200 text-sm uppercase">{country.name} <span className="text-red-500/70 text-xs ml-1">{country.prefix}</span></p>
                      <p className="text-xs font-mono text-zinc-500">Node_Cap: {pl.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-red-500 text-sm drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]">{pl.price_format}</span>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                  </div>
                </button>
              ))
            ))}
          </div>
        ) : step === 'operator' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {operators.map(op => (
              <button key={op.id} onClick={() => selectOperator(op)}
                className="card-product flex flex-col items-center justify-center gap-3 py-6 group capitalize">
                {op.image ? (
                  <Image src={op.image} alt={op.name} width={40} height={40} className="object-contain grayscale-[50%] group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                    <Phone size={18} className="text-red-500/70 group-hover:text-red-500" />
                  </div>
                )}
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide text-center">{op.name}</span>
              </button>
            ))}
          </div>
        ) : step === 'confirm' && selectedService && selectedCountry && selectedPricelist && selectedOperator ? (
          <div className="max-w-md mx-auto card border-red-600 relative overflow-hidden bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            {/* Tech Corners Component inside confirm */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
            
            <h3 className="font-black font-mono text-white text-lg uppercase tracking-widest mb-6 border-b border-red-900/50 pb-2">Confirm_Execute</h3>
            
            <div className="space-y-4 font-mono text-xs mb-6">
              {[
                { label: 'Target_Module', value: selectedService.service_name },
                { label: 'Region', value: selectedCountry.name },
                { label: 'Node_Provider', value: selectedOperator.name, cls: 'capitalize' },
                { label: 'Cost', value: selectedPricelist.price_format, cls: 'font-bold text-red-500 text-sm tracking-widest drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]' },
                { label: 'Timeout', value: '20 Mins (Auto-Refund on failure)', cls: 'text-zinc-400' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-500 uppercase">{label}</span>
                  <span className={`text-zinc-200 text-right ${cls || ''}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-red-950/20 border border-red-900/30 p-3 text-[10px] font-mono text-red-400 mb-6 flex gap-2 items-start">
              <span className="mt-0.5">{'>>'}</span>
              <p>Abort is available 3 mins post-execution. If handshake fails within 20 mins, credits will be auto-restored to main balance.</p>
            </div>

            <button onClick={handleOrder} disabled={ordering || isMaintenance} className="btn-primary w-full py-4 relative overflow-hidden group">
              <div className="absolute inset-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              {ordering ? <span className="spinner border-white/30 border-t-white" /> : 'Execute_Order'}
            </button>
            <button onClick={() => { setStep('operator'); setSelectedOperator(null); }} className="w-full mt-3 py-3 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              {'<'} Return_To_Selection
            </button>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
