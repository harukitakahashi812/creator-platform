import { NextRequest, NextResponse } from 'next/server';
import { deleteDoc, doc } from 'firebase/firestore';
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
