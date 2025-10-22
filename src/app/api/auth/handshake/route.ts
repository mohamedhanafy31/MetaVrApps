import { NextRequest, NextResponse } from 'next/server';
import { verifyHandshakeToken, createSessionToken } from '@/lib/auth/session';
import { writeLog } from '@/lib/logger';

async function handleHandshake(request: NextRequest, token: string) {
  const start = Date.now();
  try {
    const claims = verifyHandshakeToken(token);
    if (!claims) {
      await writeLog('auth.handshake.invalid', { reason: 'invalid_token' });
      return NextResponse.redirect(new URL('/admin/login?error=handshake', request.url), { status: 303 });
    }

    const expiresSeconds = claims.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30d or 24h
    const sessionToken = createSessionToken({
      userId: claims.userId,
      email: claims.email,
      role: claims.role,
      expiresAt: Date.now() + expiresSeconds * 1000,
      rememberMe: claims.rememberMe,
    });

    const res = NextResponse.redirect(new URL('/admin/dashboard', request.url), { status: 303 });
    res.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresSeconds,
      path: '/',
    });

    await writeLog('auth.handshake.success', { userId: claims.userId, role: claims.role, ms: Date.now() - start });
    return res;
  } catch (err: unknown) {
    await writeLog('auth.handshake.error', { error: String(err) });
    return NextResponse.redirect(new URL('/admin/login?error=handshake', request.url), { status: 303 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  return handleHandshake(request, token);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token || '';
  const start = Date.now();
  
  try {
    const claims = verifyHandshakeToken(token);
    if (!claims) {
      await writeLog('auth.handshake.invalid', { reason: 'invalid_token' });
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 });
    }

    const expiresSeconds = claims.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30d or 24h
    const sessionToken = createSessionToken({
      userId: claims.userId,
      email: claims.email,
      role: claims.role,
      expiresAt: Date.now() + expiresSeconds * 1000,
      rememberMe: claims.rememberMe,
    });

    const res = NextResponse.json({ success: true, message: 'Session created' });
    res.cookies.set('session', sessionToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresSeconds,
      path: '/',
    });

    await writeLog('auth.handshake.success', { userId: claims.userId, role: claims.role, ms: Date.now() - start });
    return res;
  } catch (err: unknown) {
    await writeLog('auth.handshake.error', { error: String(err) });
    return NextResponse.json({ success: false, message: 'Handshake failed' }, { status: 500 });
  }
}
