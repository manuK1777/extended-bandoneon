'use client';

import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style jsx global>{`
        main {
          padding-top: 0 !important;
        }
      `}</style>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
