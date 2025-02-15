import Link from 'next/link';
import ResponsiveNav from '../navigation/ResponsiveNav';

export default function Header() {
  return (
    <header className="fixed top-2 left-0 right-0 z-50 px-4 py-2 shadow-sm md:backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Home Icon - Hidden on mobile */}
        <div className="flex-shrink-0 z-20 hidden md:block">
          <Link href="/" className="block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 hover:text-red-600 transition-colors duration-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </Link>
        </div>

        {/* Navigation - Center */}
        <div className="flex-grow flex justify-center">
          <ResponsiveNav animated={false} direction="horizontal" />
        </div>

      </div>
    </header>
  );
}
