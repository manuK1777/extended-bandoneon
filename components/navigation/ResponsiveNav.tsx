"use client";

import { motion } from "framer-motion";
import NavButtons from "../buttons/NavButtons";
import { navItems } from "@/constants/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminNavItem from './AdminNavItem';
import MobileUserMenu from '../auth/MobileUserMenu';
import AuthButton from '../auth/AuthButton';
import { useAuth } from '@/contexts/AuthContext';

interface ResponsiveNavProps {
  direction?: "horizontal" | "vertical";
  animated?: boolean;
}

export default function ResponsiveNav({ 
  direction = "vertical",
  animated = true 
}: ResponsiveNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mobileNavItems = [
    ...navItems.map(item => ({ 
      name: item.name, 
      href: `/${item.name.toLowerCase()}`
    }))
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className={`hidden md:block ${direction === "vertical" ? "absolute z-20 left-8 top-20 sm:left-12 md:left-16 lg:left-24" : ""}`}>
        <NavButtons 
          animated={animated} 
          direction={direction} 
          className={direction === "vertical" ? "w-40 md:w-44 lg:w-48" : ""}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed z-20 top-4 right-4">
        <button 
          className="btn btn-ghost btn-circle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#D1D5DB"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 right-0 w-full h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="backdrop-blur-md bg-black/70 w-full pt-16 px-4 pb-2" ref={menuRef}>
              <div className="flex justify-between items-center fixed top-6 left-6 right-6">
                <Link 
                  href="/" 
                  className="block"
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                    }, 100);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-7 w-7 hover:text-red-600 transition-colors duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </Link>
                
                <button 
                  className="hover:rotate-90 transition-transform duration-200"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#D1D5DB"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              <ul className="menu menu-lg mt-5">
                 
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name} className={`hover:bg-yellow-200 ${isActive ? 'bg-transparent' : ''}`}>
                      <Link 
                        href={item.href}
                        className={`text-base text-fuchsia-200 font-body transition-colors duration-200 py-2 px-1
                          ${isActive ? 'text-red-600 hover:text-red-600' : 'hover:text-red-500'}`}
                        onClick={() => {
                          setIsOpen(false);
                          // Small delay to ensure smooth transition
                          setTimeout(() => {
                            window.scrollTo(0, 0);
                          }, 100);
                        }}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <AdminNavItem />
                <li className="mt-2 pb-6">
                  {user ? (
                    <MobileUserMenu />
                  ) : (
                    <div className="px-1 py-2">
                      <AuthButton />
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
