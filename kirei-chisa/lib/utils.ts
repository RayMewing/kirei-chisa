import { NextResponse } from 'next/server';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function isNokosMaintenanceTime(): boolean {
  const now = new Date();
  const wibOffset = 7 * 60; // WIB = UTC+7
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const wibMinutes = (utcMinutes + wibOffset) % (24 * 60);

  const startH = 23, startM = 20; // 23:20
  const endH = 0, endM = 25;      // 00:25

  const start = startH * 60 + startM; // 1400
  const end = endH * 60 + endM;       // 25

  // Crosses midnight: in maintenance if wibMinutes >= 1400 OR wibMinutes <= 25
  return wibMinutes >= start || wibMinutes <= end;
}

export function generateRefId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KC-${ts}-${rand}`;
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function apiSuccess(data: object, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function extractCategory(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes('alight motion') || name.includes('am ')) return 'Alight Motion';
  if (name.includes('capcut')) return 'CapCut';
  if (name.includes('netflix')) return 'Netflix';
  if (name.includes('spotify')) return 'Spotify';
  if (name.includes('youtube')) return 'YouTube';
  if (name.includes('canva')) return 'Canva';
  if (name.includes('disney')) return 'Disney+';
  if (name.includes('adobe')) return 'Adobe';
  if (name.includes('chatgpt') || name.includes('openai')) return 'ChatGPT';
  if (name.includes('tiktok')) return 'TikTok';
  return 'Lainnya';
}
