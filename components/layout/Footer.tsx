import Link from 'next/link';
import SocialMediaBar from '../SocialMediaBar';

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto bg-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-body">
        <div className="mb-0 md:mb-0 flex">
        &copy; {new Date().getFullYear()}&nbsp;
          <div className="mb-0 md:mb-0">
          <a 
            href="mailto:info@extendedbandoneon.com"
            className="hover:text-red-600 transition-colors duration-200"
          >
           The Extended Bandoneon
          </a>
          </div>
        </div>
        <div className="flex-shrink-0 z-20 order-first md:order-none mb-2 md:mb-0 md:-ml-[7rem]">
          <SocialMediaBar className="flex" />
        </div>
        <div className='text-[0.8rem] mt-2 md:mt-0'>
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
