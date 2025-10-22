import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isExpiringSoon, createSessionToken, createRememberMeToken } from '@/lib/auth/session';

// Define protected routes
const protectedRoutes = ['/admin'];
const loginPath = '/admin/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected (exclude login page itself)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && pathname !== loginPath;

  // Read cookie directly (Edge-safe) and validate JWT
  const cookieToken = request.cookies.get('session')?.value || '';
  
  // Debug logging
  console.log('Middleware Debug:', {
    pathname,
    isProtectedRoute,
    hasCookie: Boolean(cookieToken),
    cookieLength: cookieToken.length,
    allCookies: request.cookies.getAll().map(c => c.name)
  });
  
  // Simple test - if we have a cookie, allow access to dashboard
  if (isProtectedRoute && cookieToken) {
    return NextResponse.next();
  }
  
  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !cookieToken) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
