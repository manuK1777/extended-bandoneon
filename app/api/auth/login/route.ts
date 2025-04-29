import { NextRequest, NextResponse } from 'next/server';
import { generateToken, authenticateUser } from '@/utils/auth';

export async function POST(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('Missing required environment variables for authentication');
    return NextResponse.json(
      { error: 'Authentication not properly configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate request body
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (user) {
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create the response
      const response = NextResponse.json({ 
        success: true,
        message: 'Successfully logged in',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

      // Set the cookie in the response
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
