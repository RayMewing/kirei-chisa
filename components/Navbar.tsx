'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Phone, LayoutDashboard, History, CreditCard, LogOut, Menu, X, ChevronDown, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

interface UserData { username: string; email: string; premkuBalance: number; nokosBalance: number; }

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => { if (d.success) setUser(d.data); }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    toast.success('Sampai jumpa! またね 👋');
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/premku', label: 'Premku', icon: ShoppingBag },
    { href: '/nokos', label: 'Nokos OTP', icon: Phone },
    { href: '/ppob', label: 'PPOB', icon: Zap },
  ];

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'Riwayat', icon: History },
    { href: '/deposit', label: 'Deposit', icon: CreditCard },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'border-pink-100 shadow-sm shadow-pink-100/50' : 'border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="sm" />
            <div className="hidden sm:block leading-tight">
              <span className="font-black text-gray-900 text-lg">Kirei</span>
              <span className="font-black text-brand text-lg"> Chisa</span>
              <span className="text-pink-300 ml-1">✿</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all ${isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:bg-pink-50 hover:text-brand'}`}>
                <Icon size={14} />{label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                {userLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold transition-all ${isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:bg-pink-50 hover:text-brand'}`}>
                    <Icon size={14} />{label}
                  </Link>
                ))}
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-pink-50 border-2 border-pink-100 hover:border-brand/30 transition-all">
                    <div className="w-7 h-7 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center">
                      <User size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-black text-gray-800">{user.username}</span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border-2 border-pink-100 py-3 z-50">
                      <div className="px-4 pb-3 mb-1 border-b border-pink-50">
                        <p className="text-xs text-gray-400 font-medium mb-1">Saldo Premku 💳</p>
                        <p className="text-lg font-black text-brand">Rp{user.premkuBalance.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-400 font-medium mt-2 mb-1">Saldo Nokos 📱</p>
                        <p className="text-lg font-black text-blue-500">Rp{user.nokosBalance.toLocaleString('id-ID')}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Masuk</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Daftar ✨</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-pink-50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-pink-100 pb-4 px-4">
          <div className="pt-3 space-y-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isActive(href) ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-pink-50'}`}>
                <Icon size={15} />{label}
              </Link>
            ))}
            {user ? (
              <div className="border-t border-pink-50 mt-2 pt-2">
                <div className="bg-pink-50 rounded-2xl px-3 py-2.5 mb-2">
                  <p className="text-xs text-gray-400">Premku: <span className="font-black text-brand">Rp{user.premkuBalance.toLocaleString('id-ID')}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Nokos: <span className="font-black text-blue-500">Rp{user.nokosBalance.toLocaleString('id-ID')}</span></p>
                </div>
                {userLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-pink-50">
                    <Icon size={15} />{label}
                  </Link>
                ))}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-pink-50 mt-1">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-sm py-2.5">Masuk</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-sm py-2.5">Daftar ✨</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
