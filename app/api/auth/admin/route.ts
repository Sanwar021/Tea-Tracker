import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword } from '@/lib/auth'
import { createSession } from '@/lib/auth/session'
import { adminLoginSchema } from '@/lib/validations'
import { checkLoginRateLimit, clearLoginRateLimit } from '@/lib/auth/rateLimit'

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const rateLimitKey = `admin:${clientIp}`
  const limit = checkLoginRateLimit(rateLimitKey)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    )
  }
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const parsed = adminLoginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const valid = await verifyAdminPassword(parsed.data.password)
  if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

  clearLoginRateLimit(rateLimitKey)
  await createSession('admin')
  return NextResponse.json({ success: true })
}
