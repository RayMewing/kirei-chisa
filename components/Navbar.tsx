'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, ShoppingBag, Phone, LayoutDashboard, History,
  CreditCard, LogOut, Menu, X, ChevronDown, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  username: string;
  email: string;
  premkuBalance: number;
  nokosBalance: number;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => {
      if (d.success) setUser(d.data);
    }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    toast.success('Berhasil logout');
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/premku', label: 'Premku', icon: ShoppingBag },
    { href: '/nokos', label: 'Nokos OTP', icon: Phone },
  ];

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'Riwayat', icon: History },
    { href: '/deposit', label: 'Deposit', icon: CreditCard },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">KC</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg">Kirei</span>
              <span className="font-bold text-brand text-lg"> Chisa</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {userLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-all"
                  >
                    <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{user.username}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Saldo Premku</p>
                        <p className="text-base font-bold text-brand">
                          Rp{user.premkuBalance.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 mb-1">Saldo Nokos</p>
                        <p className="text-base font-bold text-blue-600">
                          Rp{user.nokosBalance.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Masuk</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Daftar</Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 px-4 animate-fade-in">
          <div className="pt-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Icon size={16} />{label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-xs text-gray-500">Saldo Premku: <span className="font-bold text-brand">Rp{user.premkuBalance.toLocaleString('id-ID')}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Saldo Nokos: <span className="font-bold text-blue-600">Rp{user.nokosBalance.toLocaleString('id-ID')}</span></p>
                  </div>
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                      <Icon size={16} />{label}
                    </Link>
                  ))}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-sm py-2.5">Masuk</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-sm py-2.5">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
