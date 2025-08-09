import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getProjectById } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting checkout session creation...');
    
    const { projectId, projectTitle, price } = await request.json();
    
    console.log('📋 Checkout request data:', { projectId, projectTitle, price });

    if (!projectId || !projectTitle) {
      console.error('❌ Missing required fields:', { projectId, projectTitle });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify project exists and is approved
    console.log('🔍 Fetching project from Firestore...');
    const { project, error } = await getProjectById(projectId);
    
    if (error || !project) {
      console.error('❌ Project not found:', error);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('✅ Project found:', { 
      id: project.id, 
      title: project.title, 
      status: project.status,
      price: project.price 
    });

    if (project.status !== 'approved') {
      console.error('❌ Project not approved:', project.status);
      return NextResponse.json({ error: 'Project not approved for purchase' }, { status: 400 });
    }

    // Use the project's price if not provided in request
    const finalPrice = price ?? project.price ?? 10;
    console.log('💰 Using price:', finalPrice);

    // Create Stripe checkout session
    console.log('💳 Creating Stripe checkout session...');
    const { session, error: stripeError } = await createCheckoutSession(projectId, projectTitle, finalPrice);

    if (stripeError || !session) {
      console.error('❌ Stripe checkout failed:', stripeError);
      return NextResponse.json({ error: stripeError || 'Failed to create session' }, { status: 500 });
    }

    console.log('✅ Stripe session created successfully:', session.id);

    // Return the checkout URL
    return NextResponse.json({ 
      success: true, 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('❌ Checkout creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}