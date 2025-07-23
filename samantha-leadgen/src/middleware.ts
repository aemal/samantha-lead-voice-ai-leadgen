import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  // Check if the path needs protection
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isPublicRoute = isAuthRoute || req.nextUrl.pathname === '/';
  
  // Supabase stores the session in cookies with keys that include the project URL
  // We need to check for any cookie that starts with 'sb-' and contains 'auth-token'
  const cookies = req.cookies.getAll();
  const hasSession = cookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  );

  // Redirect logic
  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};