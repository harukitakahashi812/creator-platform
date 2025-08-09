import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { uid, email, createdAt } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store user data in Firestore
    const userData = {
      uid,
      email,
      createdAt: new Date(createdAt),
      updatedAt: new Date(),
    };

    await addDoc(collection(db, 'users'), userData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
