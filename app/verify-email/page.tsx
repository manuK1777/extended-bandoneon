'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Component that uses useSearchParams must be wrapped in Suspense
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  // Get the redirect path from localStorage if available
  const [redirectPath, setRedirectPath] = useState<string>('/');
  const didVerifyRef = useRef(false);
  
  const [verificationStatus, setVerificationStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    error?: string;
  }>({
    loading: true,
  });

  // Load redirect path once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPath = localStorage.getItem('verificationRedirectPath');
      if (storedPath) {
        setRedirectPath(storedPath);
      }
    }
  }, []);

  // Verify exactly once per token
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus({
          loading: false,
          success: false,
          error: 'Verification token is missing',
        });
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus({
            loading: false,
            success: true,
            message: data.message || 'Your email has been verified successfully!',
          });
          
          // Show success toast
          toast.success('Email verified successfully!');
          
          // Broadcast verification success to other tabs/windows
          if (typeof window !== 'undefined') {
            // Store verification success in localStorage
            localStorage.setItem('email_verified', 'true');
            
            // Broadcast event for other tabs
            try {
              const broadcastChannel = new BroadcastChannel('auth_updates');
              broadcastChannel.postMessage({ type: 'EMAIL_VERIFIED' });
              broadcastChannel.close();
            } catch {
              // BroadcastChannel might not be supported in all browsers
              console.log('BroadcastChannel not supported, falling back to localStorage');
            }
          }
          
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            // Prefer latest stored path at redirect time
            let path = redirectPath;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('verificationRedirectPath');
              if (stored) path = stored;
              localStorage.removeItem('verificationRedirectPath');
            }
            router.push(path);
          }, 3000);
        } else {
          setVerificationStatus({
            loading: false,
            success: false,
            error: data.error || 'Failed to verify email',
          });
          
          // Show error toast
          toast.error(data.error || 'Failed to verify email');
        }
      } catch {
        setVerificationStatus({
          loading: false,
          success: false,
          error: 'An unexpected error occurred',
        });
        
        // Show error toast
        toast.error('An unexpected error occurred during verification');
      }
    };

    if (!didVerifyRef.current) {
      didVerifyRef.current = true;
      verifyEmail();
    }
  }, [token, router, redirectPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {verificationStatus.loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-center text-lg text-gray-600">
                Verifying your email...
              </p>
            </div>
          ) : verificationStatus.success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Success!</h3>
              <p className="mt-2 text-sm text-gray-500">{verificationStatus.message}</p>
              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-sm text-gray-500">{verificationStatus.error}</p>
              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-gray-600">Verifying your email address</p>
      </div>
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
