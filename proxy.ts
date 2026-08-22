import { NextResponse, type NextRequest } from 'next/server';

const adminLoginPath = '/admin/login';

function isPublicAdminPath(pathname: string) {
  return pathname === adminLoginPath;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const adminKey = process.env.ADMIN_KEY;
  const cookieKey = request.cookies.get('moyo-admin-key')?.value;

  if (adminKey && cookieKey === adminKey) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = adminLoginPath;
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
