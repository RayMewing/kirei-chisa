import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, message: 'File tidak ditemukan.' }, { status: 400 });

    if (!file.type.startsWith('image/'))
      return NextResponse.json({ success: false, message: 'Hanya file gambar yang diizinkan.' }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json({ success: false, message: 'Ukuran file maksimal 2MB.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengupload file.' }, { status: 500 });
  }
}
