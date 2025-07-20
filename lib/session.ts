import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface SessionData extends Record<string, any> {
  userId: string
  email: string
  role: string
  name: string
  establishmentId?: string
  iat?: number
  exp?: number
}

export async function createSession(data: Omit<SessionData, 'iat' | 'exp'>, remember: boolean = false) {
  const expiresIn = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 1 day
  const expires_at = Date.now() + expiresIn

  const sessionData: SessionData = {
    ...data,
    exp: Math.floor(expires_at / 1000),
    iat: Math.floor(Date.now() / 1000)
  }

  const jwt = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(expires_at))
    .sign(secret)

  cookies().set({
    name: 'custom_auth_session',
    value: jwt,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: expiresIn / 1000,
    sameSite: 'lax',
  })

  return jwt
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('custom_auth_session')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionData
  } catch (error) {
    console.error('Invalid session token:', error)
    return null
  }
}

export function clearSession() {
  cookies().set({
    name: 'custom_auth_session',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    sameSite: 'lax',
  })
}
