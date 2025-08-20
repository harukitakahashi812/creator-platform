import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function firstNonEmpty(...vals: Array<string | null | undefined>) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  }
  return undefined
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const headers = req.headers

  // Optional simple auth gate for callbacks
  const expectedToken = process.env.OFFERWALL_CALLBACK_TOKEN
  const provided = headers.get('authorization') || url.searchParams.get('token') || ''
  if (expectedToken) {
    const ok = provided === `Bearer ${expectedToken}` || provided === expectedToken
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Try to normalize common provider fields
  const provider = firstNonEmpty(
    url.searchParams.get('provider'),
    url.searchParams.get('network'),
  ) || 'unknown'

  const userId = firstNonEmpty(
    url.searchParams.get('user_id'),
    url.searchParams.get('uid'),
    url.searchParams.get('user'),
    url.searchParams.get('playerid'),
    url.searchParams.get('userid'),
  )

  const projectId = firstNonEmpty(
    url.searchParams.get('subid'),
    url.searchParams.get('sub_id'),
    url.searchParams.get('s2'),
    url.searchParams.get('aff_sub2'),
    url.searchParams.get('project_id'),
  )

  const transactionId = firstNonEmpty(
    url.searchParams.get('transaction_id'),
    url.searchParams.get('tx'),
    url.searchParams.get('conv_id'),
    url.searchParams.get('click_id'),
    url.searchParams.get('id'),
  )

  const payoutStr = firstNonEmpty(
    url.searchParams.get('payout'),
    url.searchParams.get('amount'),
    url.searchParams.get('reward'),
    url.searchParams.get('revenue'),
  )
  const payout = payoutStr ? Number(payoutStr) : 0

  if (!userId || !transactionId) {
    return NextResponse.json({ ok: false, error: 'Missing userId or transactionId' }, { status: 400 })
  }

  try {
    // Idempotency key: provider:transactionId
    const convId = `${provider}:${transactionId}`
    const convRef = doc(collection(db, 'offer_conversions'), convId)
    const existing = await getDoc(convRef)

    if (existing.exists()) {
      return NextResponse.json({ ok: true, duplicated: true })
    }

    const data = {
      provider,
      transactionId,
      userId,
      projectId: projectId || null,
      payout,
      createdAt: serverTimestamp(),
    }

    await setDoc(convRef, data)

    // If we have a projectId and payout, update funding on the project
    if (projectId && payout > 0) {
      const projectRef = doc(collection(db, 'projects'), projectId)
      await updateDoc(projectRef, {
        fundedAmount: increment(payout),
        updatedAt: new Date(),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'callback-failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Some networks POST JSON. Map JSON body to query-like handling.
  try {
    const headers = req.headers
    const expectedToken = process.env.OFFERWALL_CALLBACK_TOKEN
    const provided = headers.get('authorization') || ''
    if (expectedToken) {
      const ok = provided === `Bearer ${expectedToken}`
      if (!ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({})) as any
    const qs = new URLSearchParams()
    Object.entries(body || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.set(k, String(v))
    })

    const url = new URL(req.url)
    // Merge query string too (prefer body values)
    for (const [k, v] of url.searchParams.entries()) {
      if (!qs.has(k)) qs.set(k, v)
    }

    const shimReq = new Request(url.toString() + (qs.toString() ? `?${qs.toString()}` : ''), { headers })
    // Reuse GET handler logic by constructing a new NextRequest
    // @ts-ignore
    return GET(new NextRequest(shimReq))
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'callback-failed' }, { status: 500 })
  }
}
