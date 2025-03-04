"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavButtonProps {
  name: string;
  delay?: number;
  animated?: boolean;
  className?: string;
}

export default function NavButton({ 
  name, 
  delay = 0,
  animated = true,
  className = ""
}: NavButtonProps) {
  const href = `/${name.toLowerCase()}`;
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  const isHome = pathname === '/';
  
  const baseClasses = `btn font-body px-2 transition-colors duration-200 text-sm sm:text-base rounded-none w-full ${isHome ? 'bg-white/5' : ''}`;
  const colorClasses = isActive 
    ? "text-red-500 bg-white/5 border-white/5 hover:bg-transparent hover:border-transparent" 
    : "text-fuchsia-200 bg-transparent border-transparent hover:bg-yellow-200 hover:text-red-500";
  
  return (
    <Link href={href}>
      <motion.button
        key={name}
        className={[baseClasses, colorClasses, className].filter(Boolean).join(" ")}
        initial={animated ? { x: -90, opacity: 0 } : undefined}
        animate={animated ? { x: 0, opacity: 1 } : undefined}
        transition={animated ? { duration: 1, delay, ease: "easeOut" } : undefined}
      >
        {name}
      </motion.button>
    </Link>
  );
}
