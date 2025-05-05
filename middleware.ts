import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For simplicity, we'll just check if the token exists
    // The actual verification will happen in the admin pages/API routes
    return NextResponse.next();
  }

  // Not an admin route, proceed normally
  return NextResponse.next();
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
