import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET env variable.');
  return new TextEncoder().encode(secret);
}

const ALG = 'HS256';

export function makeSessionHelpers<T extends Record<string, any>>(cookieName: string, maxAgeSeconds: number) {
  async function create(payload: T) {
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
      .sign(secretKey());

    cookies().set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });
  }

  async function get(): Promise<T | null> {
    const token = cookies().get(cookieName)?.value;
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, secretKey());
      return payload as unknown as T;
    } catch {
      return null;
    }
  }

  function clear() {
    cookies().set(cookieName, '', { path: '/', maxAge: 0 });
  }

  return { create, get, clear, cookieName };
}
