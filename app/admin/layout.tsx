'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Receipt, Image, Settings, LogOut, Menu, X, Shield, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/banners', label: 'Banner', icon: Image },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  { href: '/admin/profile', label: 'Profil Admin', icon: User },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/auth/admin-logout', { method: 'POST' });
    toast.success('Logout admin berhasil');
    router.push('/admin/login');
  };

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Kirei Chisa</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href) ? 'bg-brand text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-base font-bold text-gray-900 flex-1">
            {adminNav.find(n => isActive(n.href))?.label ?? 'Admin'}
          </h1>
          <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-brand transition-colors">
            Lihat Website →
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
