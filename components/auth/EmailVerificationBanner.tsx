'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function EmailVerificationBanner() {
  const { user, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Don't show banner if user is not logged in, loading, or email is verified
  if (isLoading || !user || user.email_verified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      
      // Call API to resend verification email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus({
          success: true,
          message: 'Verification email sent! Please check your inbox.',
        });
      } else {
        setResendStatus({
          success: false,
          message: data.error || 'Failed to send verification email. Please try again.',
        });
      }
    } catch {
      setResendStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setResendStatus({});
      }, 5000);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your email address is not verified. Some features may be limited.
          </p>
          <div className="mt-2">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
          {resendStatus.message && (
            <p className={`mt-2 text-sm ${resendStatus.success ? 'text-green-600' : 'text-red-600'}`}>
              {resendStatus.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
