'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner { _id: string; title: string; imageUrl: string; linkUrl: string; }

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners').then(r => r.json()).then(d => {
      if (d.success && d.banners.length > 0) setBanners(d.banners);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [banners.length, next]);

  if (loading) {
    return (
      <div className="w-full bg-gray-100 rounded-2xl animate-pulse" style={{ paddingBottom: '56.25%', position: 'relative' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="spinner spinner-brand" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-brand/10 to-red-50 rounded-2xl border border-brand/20"
        style={{ paddingBottom: '56.25%', position: 'relative' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-3">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-brand font-semibold">Kirei Chisa</p>
          <p className="text-gray-500 text-sm">Premium Digital Services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md group" style={{ aspectRatio: '16/9' }}>
      {banners.map((b, i) => (
        <Link
          key={b._id}
          href={b.linkUrl || '#'}
          className={`absolute inset-0 transition-all duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* FIX: pakai <img> biasa karena imageUrl bisa berupa data: URL (base64)
              Next.js <Image> tidak support data: URL */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.imageUrl}
            alt={b.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </Link>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
