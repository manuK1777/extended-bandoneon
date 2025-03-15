'use client';

export default function ProgrammesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {children}
    </div>
  );
}
