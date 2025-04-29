"use client";

import { motion } from "framer-motion";
import NavButtons from "../buttons/NavButtons";
import { navItems } from "@/constants/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminNavItem from './AdminNavItem';

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
    { name: "Home", href: "/" },
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
      <div className="md:hidden fixed z-20 top-4 right-4" ref={menuRef}>
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
            <div className="backdrop-blur-md bg-black/70 w-full pt-16 px-4 pb-2">
              <button 
                className="fixed top-6 right-6 hover:rotate-90 transition-transform duration-200"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
              <ul className="menu menu-lg">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name} className={`hover:bg-yellow-200 ${isActive ? 'bg-transparent' : ''}`}>
                      <Link 
                        href={item.href}
                        className={`text-base text-fuchsia-200 font-body transition-colors duration-200 py-2 px-1
                          ${isActive ? 'text-red-600 hover:text-red-600' : 'hover:text-red-500'}`}
                        onClick={() => {
                          // Close menu first
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
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
