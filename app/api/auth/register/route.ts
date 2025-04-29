import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db/models/user';
import { generateToken } from '@/utils/auth';

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

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await createUser(email, password);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create the response
    const response = NextResponse.json({ 
      success: true,
      message: 'Registration successful',
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
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
