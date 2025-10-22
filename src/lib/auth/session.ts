import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SESSION_SECRET = process.env.SESSION_SECRET as string;
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable must be set');
}
const SESSION_EXPIRY = 24 * 60 * 60; // 24 hours in seconds
const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  expiresAt: number;
  rememberMe?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(data: SessionData): string {
  return jwt.sign(data, SESSION_SECRET, { expiresIn: SESSION_EXPIRY });
}

export function createRememberMeToken(data: SessionData): string {
  return jwt.sign(data, SESSION_SECRET, { expiresIn: REMEMBER_ME_EXPIRY });
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionData;
  } catch {
    return null;
  }
}

export async function setSessionCookie(sessionData: SessionData, rememberMe: boolean = false) {
  const token = rememberMe ? createRememberMeToken(sessionData) : createSessionToken(sessionData);
  const expiresAt = rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY;
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expiresAt,
    path: '/',
  });
}

export async function getSessionFromCookie(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  return verifySessionToken(token);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export function getSessionFromRequest(request: NextRequest): SessionData | null {
  const token = request.cookies.get('session')?.value;
  
  if (!token) return null;
  
  return verifySessionToken(token);
}

export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Handshake token (short lived) ------------------------------------------------
export interface HandshakeClaims {
  userId: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  rememberMe?: boolean;
}

export function createHandshakeToken(claims: HandshakeClaims, ttlSeconds = 60): string {
  return jwt.sign({ ...claims }, SESSION_SECRET, { expiresIn: ttlSeconds });
}

export function verifyHandshakeToken(token: string): (HandshakeClaims & { iat: number; exp: number }) | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as HandshakeClaims & { iat: number; exp: number };
  } catch {
    return null;
  }
}

export function isExpiringSoon(session: SessionData, thresholdSeconds: number = 3600): boolean {
  const now = Date.now();
  return session.expiresAt - now <= thresholdSeconds * 1000;
}
