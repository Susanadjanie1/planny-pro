import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const role = payload.role;

    const path = url.pathname;

    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }

    if (path.startsWith('/dashboard/manager') && !['manager', 'admin'].includes(role)) {
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
