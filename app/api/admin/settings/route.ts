import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { requireAdmin } from '@/lib/adminAuth';

// INI KUNCI UTAMANYA: Mematikan sistem cache Next.js biar data selalu fresh!
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Tambahin await buat memastikan verifikasi admin selesai dulu
  const admin = await requireAdmin(req); 
  if (admin instanceof NextResponse) return admin;
  
  await connectDB();
  const all = await Settings.find().lean();
  const map: Record<string, unknown> = {};
  all.forEach(s => { map[s.key] = s.value; });
  
  return NextResponse.json({ success: true, settings: map });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ success: false, message: 'key wajib.' }, { status: 400 });
  
  await connectDB();
  // Update data atau bikin baru kalau belum ada (upsert)
  await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  
  return NextResponse.json({ success: true, message: 'Pengaturan disimpan.' });
}
