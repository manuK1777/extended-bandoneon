"use client";

import { motion } from "framer-motion";
import NavButtons from "../buttons/NavButtons";
import { navItems } from "@/constants/navigation";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <div className={`md:hidden absolute z-20 ${pathname === '/' ? 'top-4 left-4' : 'top-4 right-4'}`}>
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
            className={`absolute mt-2 w-22 sm:w-32 ${pathname === '/' ? 'left-0' : 'right-0'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.15,
              ease: "easeOut"
            }}
          >
            <ul className="menu menu-sm p-2 backdrop-blur-md bg-black/30 rounded-lg shadow-lg flex items-left">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name} className={`hover:bg-yellow-200 ${isActive ? 'bg-transparent' : ''}`}>
                    <Link 
                      href={item.href}
                      className={`text-sm font-body transition-colors duration-200 py-2 px-1
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
            </ul>
          </motion.div>
        )}
      </div>
    </>
  );
}
