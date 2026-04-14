'use client';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function ServerStatus() {
  const [ms, setMs] = useState<number | null>(null);
  const [status, setStatus] = useState<'checking' | 'online' | 'slow' | 'offline'>('checking');

  const ping = async () => {
    setStatus('checking');
    const start = Date.now();
    try {
      await fetch('/api/ping', { cache: 'no-store' });
      const dur = Date.now() - start;
      setMs(dur);
      setStatus(dur < 300 ? 'online' : dur < 800 ? 'slow' : 'offline');
    } catch {
      setMs(null);
      setStatus('offline');
    }
  };

  useEffect(() => {
    ping();
    const t = setInterval(ping, 30000);
    return () => clearInterval(t);
  }, []);

  const theme = {
    checking: 'text-zinc-500 border-zinc-800 bg-zinc-950',
    online: 'text-emerald-500 border-emerald-900/50 bg-emerald-950/30 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]',
    slow: 'text-amber-500 border-amber-900/50 bg-amber-950/30 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]',
    offline: 'text-red-500 border-red-900/50 bg-red-950/30 drop-shadow-[0_0_5px_rgba(220,38,38,0.3)]',
  };

  const dots = {
    checking: 'bg-zinc-500 animate-ping opacity-70',
    online: 'bg-emerald-500 animate-pulse',
    slow: 'bg-amber-500 animate-pulse',
    offline: 'bg-red-500',
  };

  const coreDots = {
    checking: 'bg-zinc-500',
    online: 'bg-emerald-500',
    slow: 'bg-amber-500',
    offline: 'bg-red-500',
  };

  const labels = {
    checking: 'PINGING...',
    online: 'ONLINE',
    slow: 'HIGH LATENCY',
    offline: 'OFFLINE',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 border font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${theme[status]}`}>
      {/* Blinking Dot Indicator */}
      <div className="relative flex items-center justify-center w-2 h-2">
        <span className={`absolute inset-0 rounded-full ${dots[status]}`} />
        <span className={`relative w-1.5 h-1.5 rounded-full ${coreDots[status]}`} />
      </div>
      
      <Activity size={12} className={status === 'checking' ? 'animate-pulse' : ''} />
      
      <span className="font-bold">{labels[status]}</span>
      
      {ms !== null && (
        <span className="opacity-80 ml-1 border-l border-current pl-2.5">
          {ms}ms
        </span>
      )}
    </div>
  );
}
