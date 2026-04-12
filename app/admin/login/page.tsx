'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, Mail, Shield } from 'lucide-react';

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
      if (!data.success) { toast.error(data.message); return; }
      toast.success(data.message);
      setStep('otp');
    } finally { setLoading(false); }
  };

  const handleOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Isi 6 digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp: code }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success('Selamat datang, Admin!');
      router.push('/admin');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) document.getElementById(`adm-otp-${idx + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Kirei Chisa Dashboard</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          {step === 'creds' ? (
            <>
              <h2 className="text-white font-semibold mb-4">Masuk sebagai Admin</h2>
              <form onSubmit={handleCreds} className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email Admin</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 pl-9 text-sm focus:outline-none focus:border-brand transition-colors placeholder-gray-500"
                      placeholder="admin@kireichisa.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 pl-9 text-sm focus:outline-none focus:border-brand transition-colors placeholder-gray-500"
                      placeholder="Password admin" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-1">
                  {loading ? <span className="spinner" /> : 'Kirim OTP ke Email'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-white font-semibold">Verifikasi OTP</p>
                <p className="text-gray-400 text-xs mt-1">Kode dikirim ke <span className="text-brand">{email}</span></p>
              </div>
              <div className="flex justify-center gap-2 mb-5">
                {otp.map((d, i) => (
                  <input key={i} id={`adm-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`adm-otp-${i - 1}`)?.focus(); }}
                    className="w-11 h-11 text-center text-lg font-bold bg-gray-700 border-2 border-gray-600 text-white rounded-xl focus:outline-none focus:border-brand transition-colors" />
                ))}
              </div>
              <button onClick={handleOtp} disabled={loading}
                className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center">
                {loading ? <span className="spinner" /> : 'Verifikasi & Masuk'}
              </button>
              <button onClick={() => { setStep('creds'); setOtp(['', '', '', '', '', '']); }} className="w-full text-gray-500 text-xs mt-3 hover:text-gray-300">← Kembali</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
