'use client';

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
      {children}
    </>
  );
}
