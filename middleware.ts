import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verify(token: string | undefined) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // System admin
  if (pathname.startsWith('/sysadmin') && pathname !== '/sysadmin/login') {
    const ok = await verify(req.cookies.get('sysadmin_session')?.value);
    if (!ok) return redirectClearing(req, '/sysadmin/login', 'sysadmin_session');
    return NextResponse.next();
  }

  // School admin
  const adminPublic = ['/admin/login', '/admin/setup'];
  if (pathname.startsWith('/admin') && !adminPublic.includes(pathname)) {
    const ok = await verify(req.cookies.get('school_admin_session')?.value);
    if (!ok) return redirectClearing(req, '/admin/login', 'school_admin_session');
    return NextResponse.next();
  }

  // Student area
  const isStudentProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/sessions') || pathname.startsWith('/account');

  if (isStudentProtected) {
    const ok = await verify(req.cookies.get('student_session')?.value);
    if (!ok) return redirectClearing(req, '/login', 'student_session');
    return NextResponse.next();
  }

  return NextResponse.next();
}

function redirectClearing(req: NextRequest, path: string, cookieName: string) {
  const res = NextResponse.redirect(new URL(path, req.url));
  res.cookies.set(cookieName, '', { path: '/', maxAge: 0 });
  return res;
}

export const config = {
  matcher: ['/sysadmin/:path*', '/admin/:path*', '/dashboard/:path*', '/sessions/:path*', '/account/:path*'],
};
