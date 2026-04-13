'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Receipt, Image as ImageIcon, Settings, LogOut, Menu, X, Shield, User, Package, Crosshair, TerminalSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const adminNav = [
  { href: '/admin', label: 'Sys_Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User_Nodes', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { href: '/admin/products', label: 'Modules_DB', icon: Package },
  { href: '/admin/banners', label: 'Banners_Cfg', icon: ImageIcon },
  { href: '/admin/settings', label: 'Sys_Settings', icon: Settings },
  { href: '/admin/profile', label: 'Admin_Profile', icon: User },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/auth/admin-logout', { method: 'POST' });
    toast.success('Admin Session Terminated.');
    router.push('/admin/login');
  };

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
      
      {/* Header Sidebar */}
      <div className="p-5 border-b border-zinc-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crosshair size={28} className="text-red-600 animate-[spin_6s_linear_infinite]" />
            <div className="absolute inset-0 bg-red-500 blur-md opacity-20" />
          </div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest" style={{ textShadow: '2px 2px 0px #dc2626' }}>
              Kirei_Chisa
            </p>
            <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest mt-0.5">
              {'>>'} Admin_Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto relative z-10">
        {adminNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 font-mono text-xs uppercase tracking-widest transition-all border-l-2 ${
              isActive(href) 
                ? 'bg-red-950/30 text-red-500 border-red-500 shadow-[inset_4px_0_10px_rgba(220,38,38,0.1)]' 
                : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-700'
            }`}>
            <Icon size={16} className={isActive(href) ? 'text-red-500' : 'text-zinc-600'} /> {label}
          </Link>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-zinc-800 relative z-10">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 px-3 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-500 hover:bg-red-950/50 hover:border-red-900/50 hover:text-red-500 uppercase tracking-widest transition-all group">
          <LogOut size={16} className="group-hover:text-red-500 transition-colors" /> Disconnect
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Cyber Grid Background Global Admin */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none -z-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 relative z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex-shrink-0 border-r border-red-500/30 shadow-[4px_0_30px_rgba(220,38,38,0.2)]">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4 flex items-center gap-4 relative z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition-all">
            <Menu size={20} />
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <TerminalSquare size={18} className="text-red-500 hidden sm:block" />
            <h1 className="text-sm font-black font-mono text-white uppercase tracking-widest">
              {adminNav.find(n => isActive(n.href))?.label ?? 'System_Admin'}
            </h1>
          </div>
          
          <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-red-500 hover:text-white text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest transition-all group">
            Launch_App <span className="text-zinc-600 group-hover:text-red-500 transition-colors">{'>>'}</span>
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
