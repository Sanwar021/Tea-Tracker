import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getSessionSecret } from '@/lib/auth/secret'

const SESSION_SECRET = getSessionSecret()
const ENCODED_KEY = new TextEncoder().encode(SESSION_SECRET)

async function getSessionRole(request: NextRequest): Promise<'counter' | 'admin' | null> {
  const token = request.cookies.get('tea_session')?.value
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, ENCODED_KEY, { algorithms: ['HS256'] })
    return payload.role as 'counter' | 'admin'
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = await getSessionRole(request)

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    return NextResponse.next()
  }

  // Counter routes require counter or admin role
  if (pathname.startsWith('/counter')) {
    if (!role) {
      return NextResponse.redirect(new URL('/counter-login', request.url))
    }
    return NextResponse.next()
  }

  // API route protection
  if (pathname.startsWith('/api/entries') || pathname.startsWith('/api/sync')) {
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (pathname.startsWith('/api/employees') || pathname.startsWith('/api/export')) {
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/counter/:path*',
    '/api/entries/:path*',
    '/api/sync/:path*',
    '/api/employees/:path*',
    '/api/export/:path*',
  ],
}
