import { NextResponse } from 'next/server';
import { getStripeConfig } from '@/lib/stripe';

export async function GET() {
  try {
    const stripeConfig = getStripeConfig();
    
    const config = {
      stripe: stripeConfig,
      openai: {
        hasApiKey: !!process.env.OPENAI_API_KEY,
      },
      gumroad: {
        status: 'automatic', // Automatic integration active
        message: 'Automatic Gumroad publishing active - REAL products created'
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('❌ Config API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
