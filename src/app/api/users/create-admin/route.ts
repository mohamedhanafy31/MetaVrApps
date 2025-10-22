import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { hashPassword } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const setupTokenHeader = request.headers.get('x-setup-token') || '';
    const requiredToken = process.env.ADMIN_SETUP_TOKEN || '';
    if (!requiredToken || setupTokenHeader !== requiredToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const displayName = String(body?.displayName || '').trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists
    const usersRef = db.collection('users');
    const existing = await usersRef.where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    const docRef = await usersRef.add({
      email,
      passwordHash,
      role: 'admin',
      status: 'active',
      displayName: displayName || email,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });

    return NextResponse.json({ success: true, message: 'Admin created', userId: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}


