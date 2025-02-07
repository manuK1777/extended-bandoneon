import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto bg-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-body">
        <div className="mb-2 md:mb-0">
          {new Date().getFullYear()} - The Extended Bandoneon
        </div>
        <div className="mb-2 md:mb-0">
          <a 
            href="mailto:info@extendedbandoneon.com"
            className="hover:text-red-600 transition-colors duration-200"
          >
            Contact: info@extendedbandoneon.com
          </a>
        </div>
        <div className='text-[0.8rem]'>
          Site by{' '}
          <Link 
            href="/"
            className="hover:text-red-600 transition-colors duration-200"
          >
            <span className="inline-block [transform:rotateY(180deg)_translateY(0.3rem)]">K</span><span className="align-middle">M</span>
          
          </Link>
        </div>
      </div>
    </footer>
  );
}
