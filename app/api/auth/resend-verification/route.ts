import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth';
import { createVerificationToken } from '@/lib/db/models/emailVerification';
import { sendVerificationEmail } from '@/lib/email/emailService';

export async function POST(req: NextRequest) {
  try {
    // Get current user from auth token
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }
    
    // Create a new verification token
    const verificationToken = await createVerificationToken(user.id, 24); // 24 hours expiry
    
    // Generate verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken.token}`;
    
    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verificationUrl);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error: unknown) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
