import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, banners });
  } catch {
    return NextResponse.json({ success: false, banners: [] });
  }
}
