import { motion } from "framer-motion";
import NavButton from "./NavButton";
import NavButtonGroup from "./NavButtonGroup";

interface NavItem {
  name: string;
  delay: number;
}

interface NavButtonsProps {
  animated?: boolean;
  className?: string;
  direction?: "horizontal" | "vertical";
}

const navItems: NavItem[] = [
  { name: "Techniques", delay: 2 },
  { name: "Soundbank", delay: 2.4 },
  { name: "Articles", delay: 2.8 },
  { name: "Contact", delay: 3.2 },
];

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
      {navItems.map((item) => (
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
