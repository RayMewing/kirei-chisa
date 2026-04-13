'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: Props) {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.json()).then(d => {
      if (d.success && d.logo) setLogoUrl(d.logo);
    }).catch(() => {});
  }, []);

  const dims = { sm: 32, md: 36, lg: 52 };
  const px = dims[size];

  if (logoUrl) {
    return (
      <div className={`relative flex-shrink-0 ${className}`} style={{ width: px, height: px }}>
        <Image src={logoUrl} alt="Kirei Chisa" fill className="object-contain rounded-xl" sizes={`${px}px`} />
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-sm ${className}`}
      style={{ width: px, height: px }}
    >
      <span className="text-white font-bold" style={{ fontSize: px * 0.35 }}>KC</span>
    </div>
  );
}
