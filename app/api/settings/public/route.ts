import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [socialsDoc, faqsDoc, logoDoc] = await Promise.all([
      Settings.findOne({ key: 'socials' }),
      Settings.findOne({ key: 'faqs' }),
      Settings.findOne({ key: 'logo' }),
    ]);
    return NextResponse.json({
      success: true,
      socials: socialsDoc?.value ?? { telegram: '#', tiktok: '#', whatsapp: '#', whatsapp_channel: '#' },
      faqs: faqsDoc?.value ?? [],
      logo: logoDoc?.value ?? '',
    });
  } catch {
    return NextResponse.json({ success: true, socials: {}, faqs: [], logo: '' });
  }
}
