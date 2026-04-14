'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit2, Save, X, Users } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface User {
  _id: string; username: string; email: string; premkuBalance: number;
  nokosBalance: number; isVerified: boolean; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editVals, setEditVals] = useState({ premkuBalance: 0, nokosBalance: 0 });

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.success) setUsers(d.users);
    }).finally(() => setLoading(false));
  }, []);

  const startEdit = (user: User) => {
    setEditing(user._id);
    setEditVals({ premkuBalance: user.premkuBalance, nokosBalance: user.nokosBalance });
  };

  const saveEdit = async (userId: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...editVals }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success('Saldo user berhasil diperbarui.');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...editVals } : u));
      setEditing(null);
    } else toast.error(d.message);
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <Users className="text-red-500" size={28} />
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3" style={{ textShadow: '2px 2px 0px #dc2626' }}>
            Daftar User <span className="text-xs font-mono font-normal text-zinc-500 tracking-widest">[{users.length}]</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{'>>'} Kelola saldo dan data pengguna</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10" />
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
        <input
          className="w-full bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-4 py-3 outline-none transition-all placeholder-zinc-700"
          placeholder="Cari username atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600 z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Pengguna</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Saldo Premku</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Saldo Nokos</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Tanggal Daftar</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white text-sm">{user.username}</p>
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">{user.email}</p>
                      {!user.isVerified && (
                        <span className="text-[10px] text-amber-500 font-mono">Belum verifikasi</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {editing === user._id ? (
                        <input type="number" className="w-32 bg-zinc-950 border border-zinc-700 focus:border-red-500 text-white font-mono text-sm px-3 py-1.5 outline-none"
                          value={editVals.premkuBalance}
                          onChange={e => setEditVals(v => ({ ...v, premkuBalance: parseInt(e.target.value) || 0 }))} />
                      ) : (
                        <span className="font-bold text-red-500 font-mono text-sm">{formatRupiah(user.premkuBalance)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {editing === user._id ? (
                        <input type="number" className="w-32 bg-zinc-950 border border-zinc-700 focus:border-red-500 text-white font-mono text-sm px-3 py-1.5 outline-none"
                          value={editVals.nokosBalance}
                          onChange={e => setEditVals(v => ({ ...v, nokosBalance: parseInt(e.target.value) || 0 }))} />
                      ) : (
                        <span className="font-bold text-blue-400 font-mono text-sm">{formatRupiah(user.nokosBalance)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-500">{fmtDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      {editing === user._id ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => saveEdit(user._id)}
                            className="p-1.5 text-green-500 hover:bg-green-950/30 border border-green-900/50 transition-colors">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-800 border border-zinc-700 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(user)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-zinc-600 font-mono text-sm uppercase tracking-widest">
                {'>>'} Tidak ada user ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
