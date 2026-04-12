'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit2, Save, X } from 'lucide-react';
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
      toast.success('Saldo user diperbarui.');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...editVals } : u));
      setEditing(null);
    } else toast.error(d.message);
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-900">Daftar User <span className="text-gray-400 font-normal text-base">({users.length})</span></h1>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9 bg-white" placeholder="Cari username atau email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Saldo Premku</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Saldo Nokos</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Daftar</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {!user.isVerified && <span className="text-xs text-red-500">Belum verifikasi</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editing === user._id ? (
                        <input type="number" className="input text-sm w-32" value={editVals.premkuBalance}
                          onChange={e => setEditVals(v => ({ ...v, premkuBalance: parseInt(e.target.value) || 0 }))} />
                      ) : (
                        <span className="text-sm font-medium text-brand">{formatRupiah(user.premkuBalance)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editing === user._id ? (
                        <input type="number" className="input text-sm w-32" value={editVals.nokosBalance}
                          onChange={e => setEditVals(v => ({ ...v, nokosBalance: parseInt(e.target.value) || 0 }))} />
                      ) : (
                        <span className="text-sm font-medium text-blue-600">{formatRupiah(user.nokosBalance)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {editing === user._id ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => saveEdit(user._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Save size={14} /></button>
                          <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(user)} className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">User tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
