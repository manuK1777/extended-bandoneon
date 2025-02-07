import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function WithHeaderFooterLayout({
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
      <Footer />
    </>
  );
}
