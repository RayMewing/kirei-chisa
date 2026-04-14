'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Phone, LayoutDashboard, History, CreditCard, LogOut, Menu, X, ChevronDown, User, Zap, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
// import Logo from '@/components/Logo'; // Kita hide dulu logo lamanya biar match sama tema terminal

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
    toast.success('Session Terminated. Goodbye_');
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/premku', label: 'Premku', icon: ShoppingBag },
    { href: '/nokos', label: 'Nokos OTP', icon: Phone },
    { href: '/ppob', label: 'PPOB', icon: Zap },
  ];

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'History', icon: History },
    { href: '/deposit', label: 'Deposit', icon: CreditCard },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans selection:bg-red-600 selection:text-white ${scrolled ? 'border-b border-red-900/50 bg-zinc-950/90 backdrop-blur-md shadow-[0_4px_30px_rgba(220,38,38,0.1)]' : 'border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="relative">
              <Crosshair className="text-red-600 group-hover:text-red-400 animate-[spin_6s_linear_infinite] transition-colors" size={24} />
              <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-white text-xl uppercase tracking-widest block" style={{ textShadow: '2px 2px 0px #dc2626' }}>Kirei Chisa</span>
              <span className="text-[9px] font-mono text-red-500 tracking-[0.2em] uppercase">Online // Active</span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${isActive(href) ? 'bg-red-950/30 text-red-500 border-red-500' : 'border-transparent text-zinc-400 hover:text-red-400 hover:border-red-900/50 hover:bg-zinc-900/50'}`}>
                <Icon size={14} className={isActive(href) ? 'text-red-500' : 'text-zinc-500'} /> {label}
              </Link>
            ))}
          </div>

          {/* DESKTOP USER ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-1 border-r border-zinc-800 pr-3 mr-1">
                  {userLinks.map(({ href, icon: Icon }) => (
                    <Link key={href} href={href} title={href.replace('/', '').toUpperCase()} className={`p-2 transition-all border ${isActive(href) ? 'bg-red-950/30 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'border-transparent text-zinc-400 hover:text-red-400 hover:border-zinc-700 hover:bg-zinc-900'}`}>
                      <Icon size={16} />
                    </Link>
                  ))}
                </div>
                
                {/* User Dropdown */}
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)} className={`flex items-center gap-2 px-3 py-1.5 border transition-all ${dropOpen ? 'bg-zinc-900 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-300'}`}>
                    <div className="w-6 h-6 bg-red-600/20 border border-red-500/50 flex items-center justify-center">
                      <User size={12} className="text-red-500" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">{user.username}</span>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${dropOpen ? 'rotate-180 text-red-500' : ''}`} />
                  </button>
                  
                  {dropOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-zinc-950/95 backdrop-blur-xl border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] z-50">
                      {/* Tech Corners */}
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

                      <div className="px-5 py-4 border-b border-zinc-800 relative z-10">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><ShoppingBag size={10} className="text-red-500" /> Premku_Credits</p>
                        <p className="text-lg font-black text-white font-mono drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">Rp{user.premkuBalance.toLocaleString('id-ID')}</p>
                        
                        <div className="w-full h-px bg-zinc-800 my-3"></div>
                        
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Phone size={10} className="text-white" /> Nokos_Credits</p>
                        <p className="text-lg font-black text-white font-mono">Rp{user.nokosBalance.toLocaleString('id-ID')}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-bold text-red-500 hover:bg-red-950/50 hover:text-red-400 transition-colors uppercase tracking-widest relative z-10">
                        <LogOut size={14} /> Disconnect Session
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors">Initialize_Login</Link>
                <Link href="/register" className="btn-primary text-xs py-2 px-5 group">
                  Create_Node <span className="group-hover:animate-pulse ml-1">_</span>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 pb-6 pt-2 h-screen overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 pl-2">{'>>'} Main_Modules</p>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all border-l-2 ${isActive(href) ? 'bg-red-950/20 text-red-500 border-red-500' : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
                <Icon size={16} className={isActive(href) ? 'text-red-500' : 'text-zinc-500'} />{label}
              </Link>
            ))}
            
            {user ? (
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3 pl-2">{'>>'} User_Data</p>
                <div className="bg-zinc-900 border border-zinc-800 p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Premku_Credits</p>
                    <p className="text-xs font-mono font-bold text-red-500">Rp{user.premkuBalance.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Nokos_Credits</p>
                    <p className="text-xs font-mono font-bold text-white">Rp{user.nokosBalance.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  {userLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all border-l-2 ${isActive(href) ? 'bg-red-950/20 text-red-500 border-red-500' : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
                      <Icon size={16} className={isActive(href) ? 'text-red-500' : 'text-zinc-500'} />{label}
                    </Link>
                  ))}
                </div>

                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-4 text-xs font-mono font-bold text-red-500 bg-red-950/20 hover:bg-red-900/40 border border-red-900/50 transition-colors uppercase tracking-widest">
                  <LogOut size={16} /> Disconnect Session
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-6 border-t border-zinc-800 mt-4">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-xs py-4 text-center w-full">Initialize_Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-xs py-4 text-center w-full">Create_Node</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
