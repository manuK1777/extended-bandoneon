import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/utils/auth';

export const runtime = 'nodejs'; // Explicitly use Node.js runtime

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Create response with user data
    const response = NextResponse.json({ user }, { status: 200 });
    
    // Set cookie in the response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Create response for logout
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  response.cookies.delete('auth_token');
  
  return response;
}
