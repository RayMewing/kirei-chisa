import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyAdminToken } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/deposit', '/history', '/premku', '/nokos'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kc_token')?.value;
  const adminToken = request.cookies.get('kc_admin_token')?.value;

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!adminToken || !verifyAdminToken(adminToken)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin login page - redirect if already admin
  if (pathname === '/admin/login') {
    if (adminToken && verifyAdminToken(adminToken)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protected user routes
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Auth routes - redirect if already logged in
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  if (isAuth) {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
