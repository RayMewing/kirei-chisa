import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function signAdminToken(payload: { adminId: string; email: string }): string {
  return jwt.sign(payload, JWT_ADMIN_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): { adminId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_ADMIN_SECRET) as { adminId: string; email: string };
  } catch {
    return null;
  }
}

export function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('kc_token')?.value ?? null;
}

export function getAdminTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('kc_admin_token')?.value ?? null;
}

export function getAuthUser(): JWTPayload | null {
  const token = getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export function getAdminUser(): { adminId: string; email: string } | null {
  const token = getAdminTokenFromCookies();
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('kc_token')?.value ?? null;
}

export function getAdminTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('kc_admin_token')?.value ?? null;
}
