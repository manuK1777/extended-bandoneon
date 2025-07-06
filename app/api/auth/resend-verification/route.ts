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
    let baseUrl;
    
    // In development, always use the local URL from request headers
    if (process.env.NODE_ENV === 'development') {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = 'http://';
      baseUrl = `${protocol}${host}`;
    } else {
      // In production, use the configured URL
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        // Fallback if somehow NEXT_PUBLIC_APP_URL is not set in production
        // In production, the host header should always be present
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
