import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await connectDB();
  const all = await Settings.find().lean();
  const map: Record<string, unknown> = {};
  all.forEach(s => { map[s.key] = s.value; });
  return NextResponse.json({ success: true, settings: map });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ success: false, message: 'key wajib.' }, { status: 400 });
  await connectDB();
  await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  return NextResponse.json({ success: true, message: 'Pengaturan disimpan.' });
}
