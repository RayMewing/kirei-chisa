import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await connectDB();
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ success: true, banners });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { title, imageUrl, linkUrl, order } = await req.json();
  if (!title || !imageUrl) return NextResponse.json({ success: false, message: 'Title dan imageUrl wajib.' }, { status: 400 });
  await connectDB();
  const banner = await Banner.create({ title, imageUrl, linkUrl: linkUrl || '#', order: order || 0 });
  return NextResponse.json({ success: true, banner });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ success: false, message: 'id wajib.' }, { status: 400 });
  await connectDB();
  const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, banner });
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ success: false, message: 'id wajib.' }, { status: 400 });
  await connectDB();
  await Banner.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: 'Banner dihapus.' });
}
