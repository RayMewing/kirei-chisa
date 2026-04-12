'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      setUserId(data.userId);
      toast.success(data.message);
      setStep('otp');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Isi 6 digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: code }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success('Akun berhasil dibuat!');
      router.push('/dashboard');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) toast.success('OTP baru terkirim!'); else toast.error(data.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KC</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-xl">Kirei</span>
              <span className="font-bold text-brand text-xl"> Chisa</span>
            </div>
          </Link>
        </div>

        <div className="card shadow-lg border border-gray-100">
          {step === 'form' ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Buat Akun Baru</h1>
                <p className="text-sm text-gray-500 mt-1">Daftar gratis dan mulai berbelanja</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" placeholder="username_kamu" value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" className="input pl-9" placeholder="email@kamu.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Min. 6 karakter"
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? <span className="spinner" /> : <><span>Daftar Sekarang</span><ArrowRight size={16} /></>}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-5">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-brand font-semibold hover:underline">Masuk</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={26} className="text-brand" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Verifikasi Email</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Masukkan 6 digit OTP yang dikirim ke<br />
                  <span className="font-semibold text-gray-700">{form.email}</span>
                </p>
              </div>
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    className="otp-input" value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)} />
                ))}
              </div>
              <button onClick={handleVerify} disabled={loading} className="btn-primary w-full py-3">
                {loading ? <span className="spinner" /> : 'Verifikasi'}
              </button>
              <div className="text-center mt-4 space-y-2">
                <button onClick={handleResend} className="text-sm text-gray-500 hover:text-brand transition-colors">
                  Kirim ulang OTP
                </button>
                <br />
                <button onClick={() => setStep('form')} className="text-sm text-gray-400 hover:text-gray-600">
                  ← Kembali
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
