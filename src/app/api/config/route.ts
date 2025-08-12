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
        status: process.env.GUMROAD_WORKER_URL ? 'worker' : 'automatic',
        message: process.env.GUMROAD_WORKER_URL
          ? 'Gumroad publishing via remote worker'
          : 'Automatic Gumroad publishing active - REAL products created'
      },
      openaiStartupFund: {
        implemented: false,
        note: 'No official API integration. Use receipts and URLs for application.'
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('❌ Config API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
