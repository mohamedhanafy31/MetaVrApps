import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hashPassword, generateSecurePassword } from '@/lib/auth/session';
import { db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { writeLog } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = getSessionFromRequest(request);
    if (!session || !['admin', 'moderator'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2]; // Get the ID from the URL
    
    const body = await request.json();
    const { notes } = body;

    // Get access request
    const accessRequestRef = db.collection('requests').doc(id);
    const accessRequestDoc = await accessRequestRef.get();
    
    if (!accessRequestDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Access request not found' },
        { status: 404 }
      );
    }

    const accessRequestData = accessRequestDoc.data() as Record<string, unknown>;

    // Fetch application trial defaults if needed
    const applicationId: string | undefined = accessRequestData?.applicationId;
    let applicationData: Record<string, unknown> | null = null;
    if (applicationId) {
      const appDoc = await db.collection('applications').doc(applicationId).get();
      applicationData = appDoc.exists ? appDoc.data() : null;
    }

    // Find or create user by email (suspended on rejection)
    const email: string = String(accessRequestData?.email || '').toLowerCase();
    const fullName: string = String(accessRequestData?.fullName || email);
    const usersRef = db.collection('users');
    const existingUserQuery = await usersRef.where('email', '==', email).limit(1).get();

    let userId: string;
    const now = new Date();

    if (existingUserQuery.empty) {
      // Create new suspended user on rejection
      const tempPassword = generateSecurePassword();
      const passwordHash = await hashPassword(tempPassword);
      const applications = [
        {
          applicationId,
          status: 'rejected',
          approvedAt: null,
          rejectedAt: now,
          trial: applicationData?.trialDefaults
            ? { ...applicationData.trialDefaults, used: 0, startDate: now, endDate: null }
            : { type: 'count', limit: 0, used: 0, startDate: now, endDate: now },
        },
      ];
      const newUserDoc = await usersRef.add({
        email,
        displayName: fullName,
        passwordHash,
        role: 'user',
        status: 'suspended',
        metadata: {
          company: accessRequestData?.company || accessRequestData?.companyName || null,
          jobTitle: accessRequestData?.jobTitle || null,
          phone: accessRequestData?.phone || null,
        },
        applications,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      });
      userId = newUserDoc.id;
    } else {
      // Attach application with rejected status to existing user
      const userDoc = existingUserQuery.docs[0];
      userId = userDoc.id;
      const userData = userDoc.data() as Record<string, unknown>;
      const userApps: Record<string, unknown>[] = Array.isArray(userData?.applications) ? [...userData.applications] : [];
      const index = userApps.findIndex(a => a?.applicationId === applicationId);
      const appEntry = {
        applicationId,
        status: 'rejected',
        approvedAt: null,
        rejectedAt: now,
        trial: applicationData?.trialDefaults
          ? { ...applicationData.trialDefaults, used: 0, startDate: now, endDate: now }
          : { type: 'count', limit: 0, used: 0, startDate: now, endDate: now },
      };
      if (index >= 0) {
        userApps[index] = { ...userApps[index], ...appEntry };
      } else {
        userApps.push(appEntry);
      }
      await usersRef.doc(userId).update({ applications: userApps, updatedAt: now });
    }

    // Update access request
    await accessRequestRef.update({
      status: 'rejected',
      processedAt: now,
      processedBy: session.userId,
      notes: notes || null,
      userId,
    });

    // Increment analytics counters
    await db
      .collection('analytics')
      .doc('counters')
      .set({ rejectedRequests: FieldValue.increment(1), updatedAt: now }, { merge: true });

    // Queue rejection email (simulated)
    await writeLog('email.queue', {
      type: 'request_rejected',
      to: email,
      applicationId,
      reasonProvided: Boolean(notes),
    });

    return NextResponse.json({
      success: true,
      message: 'Access request rejected',
      data: { requestId: id, userId },
    });
  } catch (error) {
    console.error('Reject access request error:', error);
    console.error('Error details:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      // id and session are not available here due to scope; intentionally omitted
    });
    return NextResponse.json(
      { success: false, message: 'Failed to reject access request', error: (error as Error)?.message },
      { status: 500 }
    );
  }
}
