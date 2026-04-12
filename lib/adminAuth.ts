import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('kc_admin_token')?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const admin = verifyAdminToken(token);
  if (!admin) return NextResponse.json({ success: false, message: 'Sesi admin tidak valid.' }, { status: 401 });
  return admin;
}
