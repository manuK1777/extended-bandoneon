import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { findUserByEmail, sanitizeUser } from '@/lib/db/models/user';

export const runtime = 'nodejs'; // Explicitly use Node.js runtime

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Return a successful response with null user instead of 401
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      // Return a successful response with null user instead of 401
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }
    
    // Get user from database
    const user = await findUserByEmail(payload.email);
    if (!user) {
      // Return a successful response with null user instead of 401
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }
    
    // Return user without password
    return NextResponse.json({ 
      user: sanitizeUser(user), 
      authenticated: true 
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    // Return a successful response with null user instead of 500
    return NextResponse.json({ 
      user: null, 
      authenticated: false,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 200 });
  }
}
