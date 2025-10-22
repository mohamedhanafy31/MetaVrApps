import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { db } from '@/lib/firebase/admin';
import { hashPassword, generateSecurePassword } from '@/lib/auth/session';
import { writeLog } from '@/lib/logger';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = getSessionFromRequest(request);
    if (!session || !['admin', 'moderator'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const limitNum = limitParam ? parseInt(limitParam) : 100;

    let query = db.collection('users').orderBy('createdAt', 'desc').limit(limitNum);

    if (role) {
      query = query.where('role', '==', role);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    const querySnapshot = await query.get();
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    await writeLog('users.list.success', { 
      userId: session.userId, 
      count: users.length,
      filters: { role, status }
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('List users error:', error);
    await writeLog('users.list.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, displayName, role, metadata, trial } = body;

    // Validate required fields
    if (!email || !displayName || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserQuery = await db.collection('users').where('email', '==', email).get();
    if (!existingUserQuery.empty) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate secure password
    const password = generateSecurePassword();
    const passwordHash = await hashPassword(password);

    // Create user data
    const userData = {
      email,
      displayName,
      passwordHash,
      role: role || 'user',
      status: 'active',
      metadata: metadata || {},
      trial: trial || {
        type: 'count',
        limit: 10,
        used: 0,
        startDate: new Date(),
        endDate: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    };

    const userDocRef = await db.collection('users').add(userData);

    await writeLog('users.create.success', { 
      userId: session.userId, 
      newUserId: userDocRef.id,
      email,
      role
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        id: userDocRef.id,
        email,
        displayName,
        role,
        password, // Only for development - remove in production
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    await writeLog('users.create.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete all users
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication - only admin can delete all users
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users to delete',
        data: { deletedCount: 0 }
      });
    }

    // Delete all users in batch
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    await writeLog('users.delete_all.success', { 
      userId: session.userId, 
      deletedCount: usersSnapshot.docs.length
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${usersSnapshot.docs.length} users`,
      data: { deletedCount: usersSnapshot.docs.length }
    });
  } catch (error) {
    console.error('Delete all users error:', error);
    await writeLog('users.delete_all.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to delete all users' },
      { status: 500 }
    );
  }
}
