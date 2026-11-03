import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { getSessionSecret } from './secret'

const SESSION_SECRET = getSessionSecret()
const ENCODED_KEY = new TextEncoder().encode(SESSION_SECRET)

export type SessionPayload = {
  role: 'counter' | 'admin'
  expiresAt: Date
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ENCODED_KEY)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ENCODED_KEY, {
      algorithms: ['HS256'],
    })
    return {
      role: payload.role as 'counter' | 'admin',
      expiresAt: new Date((payload.exp || 0) * 1000),
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('tea_session')?.value
  if (!token) return null
  return verifySession(token)
}

export async function createSession(role: 'counter' | 'admin'): Promise<string> {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const token = await signSession({ role, expiresAt })
  
  const cookieStore = await cookies()
  cookieStore.set('tea_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
  
  return token
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('tea_session')
}
