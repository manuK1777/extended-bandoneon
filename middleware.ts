import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './utils/auth';

export function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);

  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    // Skip authentication for the login page itself
    if (request.nextUrl.pathname === '/login') {
      console.log('Skipping authentication for login page');
      return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;
    console.log('Token found:', !!token);
    
    // If no token is present, redirect to login
    if (!token) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify the token and check if the user is an admin
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      console.log('Invalid token or not an admin, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Token is valid and user is admin, proceed with the request
    console.log('Token valid and user is admin, proceeding to admin route');
    return NextResponse.next();
  }

  // Not an admin route, proceed normally
  console.log('Not an admin route, proceeding normally');
  return NextResponse.next();
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
