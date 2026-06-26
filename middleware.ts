import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isApiRoute) return NextResponse.next();
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/projects', req.nextUrl));
  }
  if (!isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
