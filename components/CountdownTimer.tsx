'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  expiresAt: string;
  onExpire?: () => void;
  label?: string;
}

export default function CountdownTimer({ expiresAt, onExpire, label = 'Berakhir dalam' }: Props) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, diff));
      if (diff <= 0 && onExpire) onExpire();
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 120000 && remaining > 0;
  const isExpired = remaining === 0;

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
        <Clock size={11} /> Waktu habis
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
      <Clock size={11} />
      {label}: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}
