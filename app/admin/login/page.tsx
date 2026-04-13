'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, Mail, Shield, Crosshair, ArrowRight, TerminalSquare } from 'lucide-react';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(`Auth_Error: ${data.message}`); return; }
      toast.success('Credentials Accepted. Awaiting OTP_');
      setStep('otp');
    } finally { setLoading(false); }
  };

  const handleOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Require 6-digit decryption key.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp: code }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(`Auth_Error: ${data.message}`); return; }
      toast.success('System Override Complete. Welcome, Admin.');
      router.push('/admin');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) document.getElementById(`adm-otp-${idx + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Grid & Glow Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="w-full max-w-sm relative z-10">
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4 group flex items-center justify-center">
            <Shield size={40} className="text-red-600 group-hover:text-red-500 relative z-10 transition-colors" />
            <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <Crosshair size={60} className="absolute inset-0 text-red-900/30 animate-[spin_10s_linear_infinite]" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            SYS.ADMIN_PORTAL
          </h1>
          <p className="font-mono text-xs text-red-500 tracking-widest mt-1 uppercase">
            {'>>'} Restricted_Access_Only
          </p>
        </div>

        {/* Login Card Panel */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-red-900/50 p-6 sm:p-8 relative shadow-[0_0_30px_rgba(220,38,38,0.1)]">
          {/* Tech Corners */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-600"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-600"></div>
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-0" />

          <div className="relative z-10">
            {step === 'creds' ? (
              <>
                <div className="mb-6 border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TerminalSquare size={16} className="text-red-500" /> Authenticate_Admin
                  </h2>
                </div>
                
                <form onSubmit={handleCreds} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Admin_Comm_Link</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-4 py-3 outline-none transition-all placeholder-zinc-700"
                        placeholder="sysadmin@network.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Master_Passkey</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-4 py-3 outline-none transition-all placeholder-zinc-700"
                        placeholder="Enter master key" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-4 mt-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <span className="spinner border-white/30 border-t-white" /> : <><span>Transmit_Creds</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6 border-b border-zinc-800 pb-4">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock size={16} className="text-red-500" /> Verify_OTP_Key
                  </h2>
                  <p className="text-[10px] font-mono text-zinc-400 mt-2 uppercase tracking-widest">
                    Encrypted key sent to: <br/> <span className="text-red-500 font-bold block mt-1">{email}</span>
                  </p>
                </div>
                
                <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                  {otp.map((d, i) => (
                    <input key={i} id={`adm-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`adm-otp-${i - 1}`)?.focus(); }}
                      className="w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-mono font-black bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all text-red-500" />
                  ))}
                </div>
                
                <button onClick={handleOtp} disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <span className="spinner border-white/30 border-t-white" /> : 'Authorize_Access'}
                </button>
                
                <button onClick={() => { setStep('creds'); setOtp(['', '', '', '', '', '']); }} 
                  className="w-full text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-4 hover:text-red-400 transition-colors">
                  {'<'} Abort_Process
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
