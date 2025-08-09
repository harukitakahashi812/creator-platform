import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getGumroadCredentials, saveGumroadCredentials } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userId } = await request.json();
    
    if (!email || !password || !userId) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const result = await saveGumroadCredentials(userId, email, password);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    console.log('🔐 Gumroad credentials saved for user', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Gumroad credentials configured successfully'
    });
  } catch (error) {
    console.error('❌ Gumroad credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // This route expects a userId query to fetch per-user creds
    return NextResponse.json({
      hasCredentials: false,
      message: 'Provide userId to check credentials'
    });
  } catch (error) {
    console.error('❌ Gumroad credentials check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST_check(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    const { credentials } = await getGumroadCredentials(userId);
    const hasCredentials = !!credentials;
    return NextResponse.json({
      hasCredentials,
      message: hasCredentials ? 'Gumroad credentials configured' : 'Gumroad credentials not configured'
    });
  } catch (error) {
    console.error('❌ Gumroad credentials check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
