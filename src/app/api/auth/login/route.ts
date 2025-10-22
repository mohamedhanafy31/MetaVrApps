import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/schemas';
import { verifyPassword, createHandshakeToken } from '@/lib/auth/session';
import { db } from '@/lib/firebase/admin';
import { writeLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const reqStart = Date.now();
  try {
    const body = await request.json();
    await writeLog('auth.login.request', { ip: request.headers.get('x-forwarded-for') || 'local', body: { email: body?.email, rememberMe: body?.rememberMe } });
    const validatedData = loginSchema.parse(body);

    // Query user from Firestore
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', validatedData.email).get();

    if (querySnapshot.empty) {
      await writeLog('auth.login.invalid_email', { email: validatedData.email, ms: Date.now() - reqStart });
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, userData.passwordHash);
    if (!isValidPassword) {
      await writeLog('auth.login.invalid_password', { email: validatedData.email, ms: Date.now() - reqStart });
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (userData.status !== 'active') {
      await writeLog('auth.login.inactive', { email: validatedData.email, status: userData.status, ms: Date.now() - reqStart });
      return NextResponse.json(
        { success: false, message: 'Account is suspended or inactive' },
        { status: 401 }
      );
    }

    // Update last login
    await userDoc.ref.update({ lastLoginAt: new Date() });

    // Issue handshake token (short lived)
    const handshakeToken = createHandshakeToken({
      userId: userDoc.id,
      email: userData.email,
      role: userData.role,
      rememberMe: Boolean(validatedData.rememberMe),
    }, 60);

    await writeLog('auth.login.handshake_issued', { email: validatedData.email, userId: userDoc.id, role: userData.role, ms: Date.now() - reqStart });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      handshakeToken,
    });
  } catch (error: unknown) {
    await writeLog('auth.login.error', { error: String(error), ms: Date.now() - reqStart });
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
