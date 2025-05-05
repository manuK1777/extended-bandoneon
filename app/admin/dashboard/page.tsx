'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import the UploadSounds component with SSR disabled to avoid
// any Node.js specific code from running during server-side rendering
const UploadSounds = dynamic(() => import('@/components/dashboard/upload-sounds'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    // Only redirect if authentication has completed loading and user is not admin
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Verifying admin access...</p>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 !pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Logged in as {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {!activeComponent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => setActiveComponent('upload-sounds')}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Sounds</h2>
              <p className="text-gray-600">Upload and manage sound files.</p>
            </div>
            {/* Add more cards here for other admin functionalities */}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setActiveComponent(null)}
              className="self-start px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
            
            {activeComponent === 'upload-sounds' && <UploadSounds />}
          </div>
        )}
      </div>
    </div>
  );
}
