'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, User } from 'lucide-react';

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
      if (d.success) { toast.success(d.message); setCurrentPass(''); setNewPass(''); }
      else toast.error(d.message);
    } finally { setLoading(false); }
  };

  if (!profile) return <div className="flex justify-center pt-10"><div className="spinner spinner-brand scale-150" /></div>;

  return (
    <div className="max-w-md space-y-5">
      <h1 className="text-lg font-bold text-gray-900">Profil Admin</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center">
            <User size={26} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile.username}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Ganti Password (opsional)</p>
            <div className="space-y-3">
              <div>
                <label className="label">Password Lama</label>
                <input type="password" className="input" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Masukkan password lama" />
              </div>
              <div>
                <label className="label">Password Baru</label>
                <input type="password" className="input" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 6 karakter" />
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <span className="spinner" /> : <><Save size={14} />Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </div>
  );
}
