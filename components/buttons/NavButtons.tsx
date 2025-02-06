"use client";

import NavButton from "./NavButton";
import NavButtonGroup from "./NavButtonGroup";
import { NavItem, navItems } from "@/constants/navigation";

interface NavButtonsProps {
  animated?: boolean;
  className?: string;
  direction?: "horizontal" | "vertical";
}

export default function NavButtons({ 
  animated = true, 
  className,
  direction = "vertical" 
}: NavButtonsProps) {
  return (
    <NavButtonGroup
      direction={direction}
      animated={animated}
      className={className}
    >
      {navItems.map((item: NavItem) => (
        <NavButton
          key={item.name}
          name={item.name}
          delay={item.delay}
          animated={animated}
        />
      ))}
    </NavButtonGroup>
  );
}
