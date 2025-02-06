import { motion } from "framer-motion";

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
  return (
    <motion.button
      key={name}
      className={[
        "btn bg-white/5 border-white/5 text-white font-body px-2 hover:bg-yellow-200 hover:text-red-500 transition-colors duration-200 text-sm sm:text-base rounded-none",
        className
      ].filter(Boolean).join(" ")}
      initial={animated ? { x: -90, opacity: 0 } : undefined}
      animate={animated ? { x: 0, opacity: 1 } : undefined}
      transition={animated ? { duration: 1, delay, ease: "easeOut" } : undefined}
    >
      {name}
    </motion.button>
  );
}
