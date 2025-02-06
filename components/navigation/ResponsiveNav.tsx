import { motion } from "framer-motion";
import NavButtons from "../buttons/NavButtons";
import { navItems } from "@/constants/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block absolute z-20 left-8 top-20 sm:left-12 md:left-16 lg:left-24">
        <NavButtons animated={true} direction="vertical" className="w-40 md:w-44 lg:w-48" />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden absolute z-20 top-4 left-4">
        <div className="dropdown dropdown-bottom">
          <label 
            tabIndex={0} 
            className="btn btn-ghost btn-circle"
            onClick={() => setIsOpen(!isOpen)}
            onBlur={() => setIsOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <motion.ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 backdrop-blur-md w-22 sm:w-32 flex items-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {navItems.map((item) => (
              <li key={item.name} className="hover:bg-yellow-200">
                <Link 
                  href={`/${item.name.toLowerCase()}`}
                  className="text-xs sm:text-sm md:text-base font-body hover:text-red-500 transition-colors duration-200 py-2 px-1"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </>
  );
}
