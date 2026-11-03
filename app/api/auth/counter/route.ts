import { NextRequest, NextResponse } from 'next/server'
import { verifyCounterPin } from '@/lib/auth'
import { createSession } from '@/lib/auth/session'
import { counterLoginSchema } from '@/lib/validations'

const attempts = new Map<string, { count: number; lockUntil?: Date }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  
  const state = attempts.get(ip) || { count: 0 }
  if (state.lockUntil && new Date() < state.lockUntil) {
    const remainingMs = state.lockUntil.getTime() - Date.now()
    const remainingMin = Math.ceil(remainingMs / 60000)
    return NextResponse.json({ error: `Too many attempts. Try again in ${remainingMin} minutes.` }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const parsed = counterLoginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })

  const valid = await verifyCounterPin(parsed.data.pin)
  
  if (!valid) {
    const newCount = (state.count || 0) + 1
    const lockUntil = newCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined
    attempts.set(ip, { count: newCount, lockUntil })
    const remaining = 5 - newCount
    return NextResponse.json(
      { error: remaining > 0 ? `Invalid PIN. ${remaining} attempts remaining.` : 'Account locked for 15 minutes.' },
      { status: 401 }
    )
  }

  attempts.delete(ip)
  await createSession('counter')
  return NextResponse.json({ success: true })
}
