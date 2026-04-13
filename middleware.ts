import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/deposit', '/history', '/premku', '/nokos'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kc_token')?.value;
  const adminToken = request.cookies.get('kc_admin_token')?.value;

  // 1. Admin Login Page
  if (pathname === '/admin/login') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected User Routes
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 4. Auth Routes (Login/Register) - Redirect to dashboard if logged in
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  if (isAuth) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
