import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { db } from '@/lib/firebase/admin';
import { writeLog } from '@/lib/logger';

// GET /api/applications - List all applications
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
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limitParam = searchParams.get('limit');
    const limitNum = limitParam ? parseInt(limitParam) : 100;

    let query = db.collection('applications').orderBy('createdAt', 'desc').limit(limitNum);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (platform) {
      query = query.where('platform', '==', platform);
    }

    const querySnapshot = await query.get();
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    await writeLog('applications.list.success', { 
      userId: session.userId, 
      count: applications.length,
      filters: { status, platform }
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('List applications error:', error);
    await writeLog('applications.list.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
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
    const { 
      name, 
      description, 
      platform, 
      authRequired, 
      maxUsers, 
      trialDefaults, 
      status,
      currentUsers = 0,
      healthCheck = {
        lastCheck: new Date(),
        status: 'healthy',
      }
    } = body;

    // Validate required fields
    if (!name || !description || !platform) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if application already exists
    const existingAppQuery = await db.collection('applications').where('name', '==', name).get();
    if (!existingAppQuery.empty) {
      return NextResponse.json(
        { success: false, message: 'Application with this name already exists' },
        { status: 409 }
      );
    }

    // Create application data
    const applicationData = {
      name,
      description,
      platform: platform || 'desktop',
      authRequired: authRequired !== false,
      maxUsers: maxUsers || 50,
      currentUsers: currentUsers || 0,
      trialDefaults: trialDefaults || {
        type: 'count',
        limit: 10,
      },
      status: status || 'active',
      healthCheck: {
        lastCheck: healthCheck.lastCheck || new Date(),
        status: healthCheck.status || 'healthy',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const applicationDocRef = await db.collection('applications').add(applicationData);

    await writeLog('applications.create.success', { 
      userId: session.userId, 
      newAppId: applicationDocRef.id,
      name,
      platform
    });

    return NextResponse.json({
      success: true,
      message: 'Application created successfully',
      data: {
        id: applicationDocRef.id,
        name,
        platform,
        status,
      },
    });
  } catch (error) {
    console.error('Create application error:', error);
    await writeLog('applications.create.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// DELETE /api/applications - Delete all applications
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication - only admin can delete all applications
    const session = getSessionFromRequest(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all applications
    const applicationsSnapshot = await db.collection('applications').get();
    
    if (applicationsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No applications to delete',
        data: { deletedCount: 0 }
      });
    }

    // Delete all applications in batch
    const batch = db.batch();
    applicationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    await writeLog('applications.delete_all.success', { 
      userId: session.userId, 
      deletedCount: applicationsSnapshot.docs.length
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${applicationsSnapshot.docs.length} applications`,
      data: { deletedCount: applicationsSnapshot.docs.length }
    });
  } catch (error) {
    console.error('Delete all applications error:', error);
    await writeLog('applications.delete_all.error', { error: String(error) });
    return NextResponse.json(
      { success: false, message: 'Failed to delete all applications' },
      { status: 500 }
    );
  }
}