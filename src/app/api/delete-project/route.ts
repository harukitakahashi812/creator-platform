import { NextRequest, NextResponse } from 'next/server';
import { deleteDoc, doc, waitForPendingWrites } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Delete the project from Firestore
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);

    // Ensure the delete is acknowledged by the backend. This prevents returning 200
    // when the SDK is offline/queued (e.g., DNS issues to firestore.googleapis.com).
    try {
      await waitForPendingWrites(db);
    } catch (ackError: any) {
      console.error('Delete pending writes failed to flush:', ackError);
      return NextResponse.json(
        { error: 'Failed to confirm deletion with Firestore (network unavailable).' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
