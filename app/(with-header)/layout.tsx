import Header from "@/components/layout/Header";

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-24">
        {children}
      </main>
    </>
  );
}
