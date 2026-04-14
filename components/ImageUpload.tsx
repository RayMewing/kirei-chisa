'use client';
import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Gambar',
  aspectRatio = '16/9',
  maxSizeMB = 2,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar.'); return; }
    if (file.size > maxSizeMB * 1024 * 1024) { toast.error(`Ukuran max ${maxSizeMB}MB.`); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
        toast.success('Gambar berhasil diupload!');
      } else {
        toast.error(data.message || 'Gagal upload.');
      }
    } catch {
      toast.error('Gagal upload gambar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {label && <p className="label">{label}</p>}
      <div
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragging
            ? 'border-brand bg-brand/5'
            : value
            ? 'border-gray-200'
            : 'border-gray-200 hover:border-brand/40 bg-gray-50 hover:bg-brand/5'
        }`}
        style={{ aspectRatio }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            {/* FIX: pakai <img> biasa, bukan Next.js <Image>
                karena Next.js Image tidak support data: URL (base64) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100 z-10">
              <p className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                Ganti Gambar
              </p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-20"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            {loading ? (
              <div className="spinner spinner-brand scale-125" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  {dragging ? <Upload size={22} className="text-brand" /> : <ImageIcon size={22} />}
                </div>
                <p className="text-sm font-medium">
                  {dragging ? 'Lepaskan di sini' : 'Klik atau drag gambar'}
                </p>
                <p className="text-xs">PNG, JPG, WEBP • Max {maxSizeMB}MB</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
