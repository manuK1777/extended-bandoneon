'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
            gcTime: 30 * 60 * 1000, // Unused data is garbage collected after 30 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 5000,
            success: {
              style: {
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #10B981'
              },
            },
            error: {
              style: {
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #EF4444'
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
