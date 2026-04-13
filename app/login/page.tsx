'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 403) {
          toast.error('Akun belum diverifikasi.');
          router.push(`/register?userId=${data.userId}`);
          return;
        }
        toast.error(data.message);
        return;
      }
              toast.success('Login berhasil!');
        window.location.href = '/dashboard'; 

    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Masuk ke Akun</h1>
            <p className="text-sm text-gray-500 mt-1">Selamat datang kembali!</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
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
                <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Password kamu"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <span className="spinner" /> : <><span>Masuk</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link href="/register" className="text-brand font-semibold hover:underline">Daftar gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
