import Image from 'next/image';
import Link from 'next/link';
import ResponsiveNav from '../navigation/ResponsiveNav';
import SocialMediaBar from '../SocialMediaBar';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Container */}
        <div className="flex-shrink-0 z-20">
          <Link href="/" className="block">
            <Image
              src="/images/logo.png"  // Make sure to add your logo image
              alt="Extended Bandoneon Logo"
              width={50}
              height={50}
              className="w-auto h-12 md:h-16"
              priority
            />
          </Link>
        </div>

        {/* Navigation - Center */}
        <div className="flex-grow flex justify-center">
          <ResponsiveNav animated={false} direction="horizontal" />
        </div>

        {/* Social Media - Right */}
        <div className="flex-shrink-0 z-20">
          <SocialMediaBar className="hidden md:flex" />
        </div>
      </div>
    </header>
  );
}
