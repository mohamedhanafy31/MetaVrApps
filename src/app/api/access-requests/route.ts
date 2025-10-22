import { NextRequest, NextResponse } from 'next/server';
import { createAccessRequestSchema } from '@/lib/validations/schemas';
import { db } from '@/lib/firebase/admin';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAccessRequestSchema.parse(body);

    // Create access request document
    const accessRequestData = {
      ...validatedData,
      status: 'pending',
      createdAt: new Date(),
      processedAt: null,
      processedBy: null,
      notes: null,
    };

    const docRef = await db.collection('requests').add(accessRequestData);

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully',
      data: {
        id: docRef.id,
        ...accessRequestData,
      },
    });
  } catch (error) {
    console.error('Create access request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit access request' },
      { status: 500 }
    );
  }
}

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
    const limitParam = searchParams.get('limit');
    const limitNum = limitParam ? parseInt(limitParam) : 50;

    let query = db.collection('requests').orderBy('createdAt', 'desc').limit(limitNum);

    if (status) {
      // For now, filter in memory to avoid index requirement
      query = db.collection('requests').orderBy('createdAt', 'desc').limit(limitNum * 2);
    }

    const querySnapshot = await query.get();
    let accessRequests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as any));

    // Filter by status in memory if needed
    if (status) {
      accessRequests = accessRequests.filter(req => req.status === status).slice(0, limitNum);
    }

    return NextResponse.json({
      success: true,
      data: accessRequests,
    });
  } catch (error) {
    console.error('Get access requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch access requests' },
      { status: 500 }
    );
  }
}
