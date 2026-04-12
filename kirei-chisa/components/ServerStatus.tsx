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

  const colors = {
    checking: 'text-gray-500 bg-gray-100',
    online: 'text-green-600 bg-green-50',
    slow: 'text-yellow-600 bg-yellow-50',
    offline: 'text-red-600 bg-red-50',
  };
  const dots = {
    checking: 'bg-gray-400 animate-pulse',
    online: 'bg-green-500 animate-pulse',
    slow: 'bg-yellow-500 animate-pulse',
    offline: 'bg-red-500',
  };
  const labels = {
    checking: 'Mengecek...',
    online: 'Server Online',
    slow: 'Server Lambat',
    offline: 'Server Offline',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${colors[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dots[status]}`} />
      <Activity size={11} />
      <span>{labels[status]}</span>
      {ms !== null && <span className="opacity-70">• {ms}ms</span>}
    </div>
  );
}
