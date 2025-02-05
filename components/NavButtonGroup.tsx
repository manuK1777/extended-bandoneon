import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NavButtonGroupProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  animated?: boolean;
  className?: string;
}

export default function NavButtonGroup({ 
  children,
  direction = "vertical",
  animated = true,
  className = ""
}: NavButtonGroupProps) {
  return (
    <motion.div
      className={[
        direction === "vertical" ? "flex flex-col gap-3" : "flex flex-row gap-3",
        className
      ].filter(Boolean).join(" ")}
      initial={animated ? { x: -100, opacity: 0 } : undefined}
      animate={animated ? { x: 0, opacity: 1 } : undefined}
      transition={animated ? { duration: 0.8, delay: 1.5 } : undefined}
    >
      {children}
    </motion.div>
  );
}
