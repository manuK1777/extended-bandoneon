import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db/models/user';
import { generateToken } from '@/utils/auth';
import { createVerificationToken } from '@/lib/db/models/emailVerification';
import { sendVerificationEmail } from '@/lib/email/emailService';

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

    const user = await createUser(email, password);
    
    const verificationToken = await createVerificationToken(user.id, 24); // 24 hours expiry
    
    let baseUrl;
    
    if (process.env.NODE_ENV === 'development') {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = 'http://';
      baseUrl = `${protocol}${host}`;
    } else {
      // In production, use the configured URL
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        const host = req.headers.get('host');
        if (host) {
          const protocol = 'https://';
          baseUrl = `${protocol}${host}`;
        } else {
          // If we somehow don't have a host header in production, use a default domain
          // This is extremely unlikely but added as a last resort
          baseUrl = 'https://extendedbandoneon.com';
          console.error('WARNING: Missing host header and NEXT_PUBLIC_APP_URL in production environment');
        }
      } else if (!baseUrl.startsWith('http')) {
        // Ensure production URL has the correct protocol
        baseUrl = `https://${baseUrl}`;
      }
    }
    
    // Ensure the URL doesn't have double slashes
    const verificationUrl = `${baseUrl.replace(/\/$/, '')}/verify-email?token=${verificationToken.token}`;
    
    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create the response
    const response = NextResponse.json({ 
      success: true,
      message: 'Registration successful.Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
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
