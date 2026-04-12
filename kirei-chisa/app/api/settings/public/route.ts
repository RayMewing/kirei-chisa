import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await connectDB();
    const [socialsDoc, faqsDoc] = await Promise.all([
      Settings.findOne({ key: 'socials' }),
      Settings.findOne({ key: 'faqs' }),
    ]);

    return NextResponse.json({
      success: true,
      socials: socialsDoc?.value ?? { telegram: '#', tiktok: '#', whatsapp: '#', whatsapp_channel: '#' },
      faqs: faqsDoc?.value ?? [],
    });
  } catch {
    return NextResponse.json({ success: true, socials: {}, faqs: [] });
  }
}
