'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Crosshair, TerminalSquare } from 'lucide-react';

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
          toast.error('Auth Failed: Node Unverified.');
          router.push(`/register?userId=${data.userId}`);
          return;
        }
        toast.error(`Error: ${data.message}`);
        return;
      }
      toast.success('System Access Granted!');
      window.location.href = '/dashboard'; 

    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Grid & Glow Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="relative">
              <Crosshair size={40} className="text-red-600 group-hover:text-red-500 animate-[spin_6s_linear_infinite] transition-colors" />
              <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div>
              <h1 className="font-black text-white text-2xl uppercase tracking-[0.2em]" style={{ textShadow: '2px 2px 0px #dc2626' }}>
                Kirei_Chisa
              </h1>
              <p className="font-mono text-xs text-red-500 tracking-widest mt-1">{'>>'} SYS.LOGIN_NODE</p>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-6 sm:p-8 relative shadow-[0_0_30px_rgba(220,38,38,0.05)]">
          {/* Tech Corners */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-600"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-600"></div>
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-0" />

          <div className="relative z-10">
            <div className="mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TerminalSquare size={18} className="text-red-500" /> Authenticate_Node
              </h2>
              <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Provide credentials to access database</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Comm_Link (Email)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="email" className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-4 py-3 outline-none transition-all placeholder-zinc-700" 
                    placeholder="user@network.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">{'>>'} Passkey</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type={showPass ? 'text' : 'password'} className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-12 py-3 outline-none transition-all placeholder-zinc-700" 
                    placeholder="Enter passkey"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="spinner border-white/30 border-t-white" /> : <><span>Initialize_Login</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
            
            <div className="mt-6 border-t border-zinc-800 pt-6 text-center">
              <p className="font-mono text-xs text-zinc-500">
                No active ID?{' '}
                <Link href="/register" className="text-red-500 font-bold hover:text-red-400 hover:underline uppercase tracking-widest ml-1">Create_Node</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
