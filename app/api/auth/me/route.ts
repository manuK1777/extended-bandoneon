import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { findUserByEmail, sanitizeUser } from '@/lib/db/models/user';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Get user from database
    const user = await findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Return user without password
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
