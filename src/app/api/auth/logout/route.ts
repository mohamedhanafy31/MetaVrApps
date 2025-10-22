import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await clearSessionCookie();

    const res = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
    res.cookies.set('session', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
