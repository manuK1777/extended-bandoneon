import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db/models/user';
import { createPasswordResetToken, hasRecentPasswordResetAttempt } from '@/lib/db/models/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await findUserByEmail(normalizedEmail);
    
    // For security reasons, we always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Check for recent password reset attempts (rate limiting)
    const hasRecentAttempt = await hasRecentPasswordResetAttempt(user.id, 5);
    if (hasRecentAttempt) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id, 1); // 1 hour expiry

    // Generate reset URL
    // Prefer explicit app URL, then Vercel deployment URL (preview/production), then dev/prod fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://extendedbandoneon.com';
    
    // Ensure no double slashes in URL
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const resetUrl = `${cleanBaseUrl}/reset-password?token=${resetToken.token}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.email.split('@')[0] // Use part before @ as name
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
