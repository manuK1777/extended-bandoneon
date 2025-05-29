import { NextRequest, NextResponse } from 'next/server';
import { findVerificationByToken, verifyUserEmail } from '@/lib/db/models/emailVerification';
import { findUserById } from '@/lib/db/models/user';

export async function GET(req: NextRequest) {
  try {
    // Get token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find verification record by token
    const verification = await findVerificationByToken(token);
    
    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    if (new Date(verification.expires_at) < now) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserById(verification.user_id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If already verified, just return success
    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Verify the user's email
    await verifyUserEmail(user.id);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: unknown) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
