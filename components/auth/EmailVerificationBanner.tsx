'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function EmailVerificationBanner() {
  const { user, isLoading, resendVerificationEmail, refreshUserData } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [didAutoRefresh, setDidAutoRefresh] = useState(false);
  
  // Check if the banner was dismissed in this session
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('emailVerificationBannerDismissed') === 'true';
    }
    return false;
  });

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      
      // Use the resendVerificationEmail function from AuthContext
      const result = await resendVerificationEmail();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
      // Always refresh to sync status regardless of resend outcome
      await refreshUserData();
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserData();
      toast.success('Status refreshed');
    } catch {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  // One-time auto-refresh when banner mounts and user appears unverified
  useEffect(() => {
    if (!didAutoRefresh && user && !user.email_verified) {
      setDidAutoRefresh(true);
      // fire and forget
      refreshUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didAutoRefresh, user]);

  // Compute visibility after all hooks ran
  const shouldHide = isLoading || !user || user.email_verified || isDismissed;
  if (shouldHide) {
    return null;
  }
  
  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('emailVerificationBannerDismissed', 'true');
      setIsDismissed(true);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mt-18 md:mt-24">
      <div className="flex justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Email verification required</strong>: Your email address is not verified. Some features like downloading sounds may be limited.
            </p>
            <div className="mt-2">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-sm font-medium text-indigo-600 hover:text-yellow-600 disabled:opacity-50 mr-4"
              >
                → {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="text-sm font-medium text-indigo-600 hover:text-yellow-600 disabled:opacity-50"
              >
                → {isRefreshing ? 'Refreshing...' : 'Refresh status'}
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-yellow-500 hover:text-yellow-700"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

