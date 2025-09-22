import { Resend } from 'resend';
import { render } from '@react-email/render';
import VerificationEmail from '@/emails/VerificationEmail';
import * as React from 'react';

// Create a function to get the Resend client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not defined');
  }
  return new Resend(apiKey);
};

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

    // Get Resend client and send the email
    const resendClient = getResendClient();
    const { data, error } = await resendClient.emails.send({
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
