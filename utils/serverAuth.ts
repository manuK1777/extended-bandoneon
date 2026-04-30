import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as JwtPayload;
    }
    return null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Middleware to require authentication for API routes
 * @param handler The API route handler function
 * @returns A new handler function that checks for authentication before calling the original handler
 */
export function requireAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(req, ...args);
  };
}

/**
 * Middleware to require admin role for API routes
 * @param handler The API route handler function
 * @returns A new handler function that checks for admin role before calling the original handler
 */
export function requireAdmin(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return handler(req, ...args);
  };
}
