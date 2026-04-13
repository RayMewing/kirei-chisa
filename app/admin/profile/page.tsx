'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, User, Shield, Lock, Crosshair } from 'lucide-react';

interface AdminProfile { _id: string; username: string; email: string; createdAt: string; }

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [username, setUsername] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(d => {
      if (d.success) { setProfile(d.profile); setUsername(d.profile.username); }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const body: Record<string, string> = { username };
      if (newPass) { body.currentPassword = currentPass; body.newPassword = newPass; }
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) { toast.success('Identity Updated Successfully.'); setCurrentPass(''); setNewPass(''); }
      else toast.error(`Sys_Error: ${d.message}`);
    } finally { setLoading(false); }
  };

  if (!profile) return (
    <div className="flex flex-col items-center justify-center pt-32">
      <Crosshair size={40} className="text-red-600 animate-[spin_4s_linear_infinite] mb-4" />
      <p className="font-mono text-xs text-red-500 uppercase tracking-widest animate-pulse">Initializing_Identity_Module...</p>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <User className="text-red-500" size={28} />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Admin_Profile
          </h1>
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-10">
          {'>>'} System Administrator Identity Configuration
        </p>
      </div>

      <div className="bg-zinc-900/80 backdrop-blur-md border border-red-900/50 p-6 sm:p-8 relative shadow-[0_0_30px_rgba(220,38,38,0.05)]">
        {/* Tech Corners */}
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-600"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-600"></div>
        
        {/* Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />

        <div className="relative z-10">
          {/* Profile Badge Area */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 pb-6 border-b border-zinc-800">
            <div className="w-20 h-20 bg-zinc-950 border border-zinc-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] z-10 pointer-events-none" />
              <Shield size={32} className="text-red-500 relative z-0" />
            </div>
            <div>
              <p className="font-black font-mono text-white text-xl uppercase tracking-widest">{profile.username}</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">{profile.email}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-red-950/30 text-red-500 border border-red-900/50 px-2 py-1 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Root_Access_Granted
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">
                {'>>'} Identity_Alias (Username)
              </label>
              <input 
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_10px_rgba(220,38,38,0.2)] text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder-zinc-700" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>

            {/* Security Section */}
            <div className="border border-zinc-800 bg-zinc-950 p-5 mt-4">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/50 pb-2">
                <Lock size={14} className="text-zinc-500" />
                <p className="text-xs font-black font-mono text-white uppercase tracking-widest">Security_Override (Optional)</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Current_Passkey</label>
                  <input 
                    type="password" 
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white font-mono text-sm px-4 py-2.5 outline-none transition-all placeholder-zinc-700" 
                    value={currentPass} 
                    onChange={e => setCurrentPass(e.target.value)} 
                    placeholder="Enter current master key" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">New_Passkey</label>
                  <input 
                    type="password" 
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white font-mono text-sm px-4 py-2.5 outline-none transition-all placeholder-zinc-700" 
                    value={newPass} 
                    onChange={e => setNewPass(e.target.value)} 
                    placeholder="Min. 6 characters" 
                  />
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full py-4 mt-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase tracking-widest border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={16} /> Execute_Identity_Update</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
