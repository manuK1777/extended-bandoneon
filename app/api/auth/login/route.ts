import { NextRequest, NextResponse } from 'next/server';
import { generateToken, validateAdminCredentials } from '@/utils/auth';

export async function POST(req: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error('Missing required environment variables for authentication');
    return NextResponse.json(
      { error: 'Authentication not properly configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate request body
    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { username, password } = body;

    // Validate credentials
    if (validateAdminCredentials(username, password)) {
      // Generate JWT token
      const token = generateToken({
        username,
        isAdmin: true,
      });

      // Create the response
      const response = NextResponse.json({ 
        success: true,
        message: 'Successfully logged in'
      });

      // Set the cookie in the response
      response.cookies.set('admin_token', token, {
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
