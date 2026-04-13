'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit2, Save, X, Users, TerminalSquare } from 'lucide-react';
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
      toast.success('Node Balance Updated.');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...editVals } : u));
      setEditing(null);
    } else toast.error(`Sys_Error: ${d.message}`);
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
            User_Nodes <span className="text-xs font-mono font-normal text-zinc-500 tracking-widest">[{users.length}]</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{'>>'} Identity & Balance Control</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-600/20 blur-xl opacity-50 -z-10"></div>
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/70" />
        <input 
          className="w-full bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] text-white font-mono text-sm pl-11 pr-4 py-3 outline-none transition-all placeholder-zinc-700" 
          placeholder="Scan user alias or comm_link (email)..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-800 animate-pulse" />)}</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 relative overflow-hidden">
          {/* Tech Corners */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600 z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600 z-10 pointer-events-none"></div>
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />

          <div className="overflow-x-auto relative z-10 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Identity_Node</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Premku_Credits</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Nokos_Credits</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Creation_Date</th>
                  <th className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white text-sm uppercase tracking-wide">{user.username}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mb-1">{user.email}</p>
                      {!user.isVerified ? (
                        <span className="text-[9px] font-mono bg-red-950/30 text-red-500 border border-red-900/50 px-1.5 py-0.5 uppercase tracking-widest flex w-fit items-center gap-1 mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> Unverified
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 px-1.5 py-0.5 uppercase tracking-widest flex w-fit items-center gap-1 mt-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Active
                        </span>
                      )}
                    </td>
                    
                    <td className="px-5 py-4">
                      {editing === user._id ? (
                        <div className="flex items-center gap-1 border border-red-900/50 focus-within:border-red-500 bg-zinc-950 p-1 w-36 transition-colors">
                          <span className="text-[10px] font-mono text-zinc-500 pl-2">Rp</span>
                          <input type="number" className="w-full bg-transparent text-white font-mono text-sm outline-none" value={editVals.premkuBalance}
                            onChange={e => setEditVals(v => ({ ...v, premkuBalance: parseInt(e.target.value) || 0 }))} />
                        </div>
                      ) : (
                        <span className="text-sm font-black font-mono text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{formatRupiah(user.premkuBalance)}</span>
                      )}
                    </td>
                    
                    <td className="px-5 py-4">
                      {editing === user._id ? (
                        <div className="flex items-center gap-1 border border-blue-900/50 focus-within:border-blue-500 bg-zinc-950 p-1 w-36 transition-colors">
                          <span className="text-[10px] font-mono text-zinc-500 pl-2">Rp</span>
                          <input type="number" className="w-full bg-transparent text-white font-mono text-sm outline-none" value={editVals.nokosBalance}
                            onChange={e => setEditVals(v => ({ ...v, nokosBalance: parseInt(e.target.value) || 0 }))} />
                        </div>
                      ) : (
                        <span className="text-sm font-black font-mono text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">{formatRupiah(user.nokosBalance)}</span>
                      )}
                    </td>
                    
                    <td className="px-5 py-4 text-[10px] font-mono text-zinc-400 uppercase">{fmtDate(user.createdAt)}</td>
                    
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {editing === user._id ? (
                          <>
                            <button onClick={() => saveEdit(user._id)} className="p-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/50 transition-colors">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditing(null)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(user)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50 transition-colors">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="text-center py-12 border-t border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center">
                <TerminalSquare size={32} className="text-zinc-700 mb-3" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{'>>'} NO_USER_NODES_FOUND</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
