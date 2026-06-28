import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'sysadmin_session';
const ALG = 'HS256';

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET env variable.');
  return new TextEncoder().encode(secret);
}

export type SysAdminSession = {
  sub: string; // system_admins.id
  email: string;
};

export async function createSysAdminSession(payload: SysAdminSession) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function getSysAdminSession(): Promise<SysAdminSession | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SysAdminSession;
  } catch {
    return null;
  }
}

export function clearSysAdminSession() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export { COOKIE_NAME };
