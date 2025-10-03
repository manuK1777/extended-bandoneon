import { NextRequest, NextResponse } from 'next/server';
import { findPasswordResetByToken, markPasswordResetAsUsed } from '@/lib/db/models/passwordReset';
import { findUserById, updateUserPassword } from '@/lib/db/models/user';
import { generateToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('Missing required environment variables for authentication');
    return NextResponse.json(
      { error: 'Authentication not properly configured' },
      { status: 500 }
    );
  }
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the password reset token
    const resetToken = await findPasswordResetByToken(token);
    
    if (!resetToken) {
      console.error('Invalid or expired reset token:', { token });
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired using timestamp (more reliable across timezones)
    const nowMs = Date.now();
    if (resetToken.expires_timestamp && resetToken.expires_timestamp < nowMs) {
      console.error('Reset token has expired:', {
        tokenExpiresAtTimestamp: resetToken.expires_timestamp,
        tokenExpiresAt: resetToken.expires_at.toISOString(),
        currentTimeMs: nowMs,
        currentTime: new Date(nowMs).toISOString(),
        timeDifference: `${Math.round((nowMs - resetToken.expires_timestamp) / (60 * 1000))} minutes`
      });
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await findUserById(resetToken.user_id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's password
    await updateUserPassword(user.id, password);

    // Mark the reset token as used
    await markPasswordResetAsUsed(resetToken.id);

    // Auto-login: issue JWT and set cookie like in the login route
    const jwt = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You are now logged in.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        email_verified: Boolean(user.email_verified),
      },
      email_verified: Boolean(user.email_verified),
    });

    response.cookies.set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET route to validate reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Find the password reset token
    const resetToken = await findPasswordResetByToken(token);
    
    if (!resetToken) {
      console.error('Invalid or expired reset token:', { token });
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired using timestamp (more reliable across timezones)
    const nowMs = Date.now();
    if (resetToken.expires_timestamp && resetToken.expires_timestamp < nowMs) {
      console.error('Reset token has expired:', {
        tokenExpiresAtTimestamp: resetToken.expires_timestamp,
        tokenExpiresAt: resetToken.expires_at.toISOString(),
        currentTimeMs: nowMs,
        currentTime: new Date(nowMs).toISOString(),
        timeDifference: `${Math.round((nowMs - resetToken.expires_timestamp) / (60 * 1000))} minutes`
      });
      return NextResponse.json(
        { valid: false, error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json(
        { valid: false, error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Reset token is valid'
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { valid: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
