import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthModal from '@/components/auth/AuthModal';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';

export default function WithHeaderFooterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <EmailVerificationBanner />
      <main className="pt-18 md:pt-24 flex-grow">
        {children}
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}
