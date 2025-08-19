import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generic Offerwall postback endpoint
// Compatible with most networks that send GET callbacks with query params
// Example expected params (may vary by network):
// user_id, transaction_id, offer_id, payout, currency, signature, ip, sub_id, click_id

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    // Identify user/conversion as best as we can from common fields
    const userId = params.user_id || params.uid || params.user || params.sub_id || 'unknown';
    const transactionId = params.transaction_id || params.tx_id || params.click_id || params.tid || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const offerId = params.offer_id || params.oid || params.campaign_id || 'unknown';
    const payout = Number(params.payout || params.amount || 0);
    const currency = params.currency || 'USD';

    // Idempotency: use transactionId as the document id to avoid duplicates
    const ref = doc(collection(db, 'offerwall_conversions'), transactionId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      // Already processed
      return new NextResponse('OK', { status: 200 });
    }

    const record = {
      userId,
      transactionId,
      offerId,
      payout,
      currency,
      params,
      sourceIp: request.headers.get('x-forwarded-for') || request.ip || '',
      createdAt: new Date().toISOString(),
    } as const;

    await setDoc(ref, record, { merge: true });

    // TODO: Optionally, increment a user balance or mark project funding
    // For now, we just store the conversion event for reporting.

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('Offerwall callback error:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try JSON body first
    let params: Record<string, string> = {};
    const contentType = request.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        const json = await request.json();
        params = Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v)]));
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        const sp = new URLSearchParams(text);
        params = Object.fromEntries(sp.entries());
      } else {
        // Fallback: treat as query string
        const url = new URL(request.url);
        params = Object.fromEntries(url.searchParams.entries());
      }
    } catch {
      const url = new URL(request.url);
      params = Object.fromEntries(url.searchParams.entries());
    }

    const userId = params.user_id || params.uid || params.user || params.sub_id || 'unknown';
    const transactionId = params.transaction_id || params.tx_id || params.click_id || params.tid || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const offerId = params.offer_id || params.oid || params.campaign_id || 'unknown';
    const payout = Number(params.payout || params.amount || 0);
    const currency = params.currency || 'USD';

    const ref = doc(collection(db, 'offerwall_conversions'), transactionId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return new NextResponse('OK', { status: 200 });
    }

    const record = {
      userId,
      transactionId,
      offerId,
      payout,
      currency,
      params,
      sourceIp: request.headers.get('x-forwarded-for') || request.ip || '',
      createdAt: new Date().toISOString(),
    } as const;

    await setDoc(ref, record, { merge: true });
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('Offerwall callback POST error:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}


