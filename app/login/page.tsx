'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Create a client-only component
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, openLoginModal } = useAuth();

  useEffect(() => {
    // If already authenticated and admin, redirect to admin dashboard
    if (isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
    } 
    // If not authenticated, open the login modal
    else if (!isAuthenticated) {
      openLoginModal();
    }
    // If authenticated but not admin, redirect to home
    else {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router, openLoginModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Redirecting...
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please wait while we redirect you to the appropriate page.
        </p>
      </div>
    </div>
  );
}
