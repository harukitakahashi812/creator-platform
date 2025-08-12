import Stripe from 'stripe';

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY. Please check your .env.local file.');
}

// Determine if we're in test mode or live mode
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || !process.env.STRIPE_SECRET_KEY;
const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');

if (isTestMode) {
  console.warn('⚠️ Stripe is running in TEST mode. No real charges will be made.');
} else if (isLiveMode) {
  console.log('✅ Stripe is running in LIVE mode. Real charges will be processed.');
} else {
  console.error('❌ Invalid Stripe secret key format. Must start with sk_test_ or sk_live_');
}

// Use Stripe's default API version for compatibility unless you need a pinned version
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const createCheckoutSession = async (projectId: string, projectTitle: string, price: number) => {
  console.log('🤖 Stripe checkout session creation started:', { projectId, projectTitle, price });
  
  if (!stripe) {
    console.error('❌ Stripe not configured - missing STRIPE_SECRET_KEY');
    return { session: null, error: 'Stripe not configured' };
  }

  if (!projectId || !projectTitle) {
    console.error('❌ Missing required parameters:', { projectId, projectTitle });
    return { session: null, error: 'Missing required parameters' };
  }

  if (!price || price <= 0) {
    console.error('❌ Invalid price:', price);
    return { session: null, error: 'Invalid price' };
  }
  
  try {
    console.log('💳 Creating Stripe session with price:', price);
    console.log('🔧 Stripe mode:', isTestMode ? 'TEST' : 'LIVE');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: projectTitle,
              description: `Purchase access to ${projectTitle}`,
            },
            unit_amount: Math.round(price * 100), // price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/project/${projectId}`,
      metadata: {
        projectId,
        mode: isTestMode ? 'test' : 'live',
      },
    });

    console.log('✅ Stripe session created successfully:', session.id);
    return { session, error: null };
  } catch (error: any) {
    console.error('❌ Stripe API error:', error);
    return { session: null, error: error.message };
  }
};

// Helper function to check if we're in test mode
export const isStripeTestMode = () => isTestMode;

// Helper function to get Stripe configuration info
export const getStripeConfig = () => ({
  isTestMode,
  isLiveMode,
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
}); 