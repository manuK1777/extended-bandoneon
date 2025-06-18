import { Resend } from 'resend';
import { render } from '@react-email/render';
import VerificationEmail from '@/emails/VerificationEmail';
import * as React from 'react';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send verification email
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    // Render the React email template to HTML
    const html = await render(
      React.createElement(VerificationEmail, { verificationUrl, userName })
    );

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `Extended Bandoneon <${process.env.EMAIL_FROM || 'info@extendedbandoneon.com'}>`,
      to: email,
      subject: 'Confirm your email for Extended Bandoneon',
      html,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}
