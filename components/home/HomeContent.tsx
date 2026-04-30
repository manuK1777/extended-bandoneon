"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ResponsiveNav from "../navigation/ResponsiveNav";
import AuthButton from "../auth/AuthButton";
import UserMenu from "../auth/UserMenu";
import AuthModal from "../auth/AuthModal";

export default function HomeContent() {
  return (
    <div className="fixed inset-0 w-full overflow-hidden flex flex-col">
      {/* Hero Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 5,
          ease: "easeOut",
        }}
      >
        <Image
          src="https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg"
          alt="Woman with a bandoneon in a yellow dress"
          fill
          priority
          className="object-cover object-center sm:object-[25%_center]"
          quality={100}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      <div className="relative z-20 flex justify-end p-6">
        <div className="hidden md:block">
          <AuthButton />
        </div>
        <div className="hidden md:block">
          <UserMenu />
        </div>
      </div>

      <ResponsiveNav />

      <AuthModal />

      {/* Content */}
      <motion.div
        className="relative z-10 flex items-end justify-center h-full pb-[4rem] sm:pb-[6rem] md:pb-[6rem] lg:pb-[0]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <h1
          className="text-[3.8rem] sm:text-[4.3rem] md:text-[4.5rem] lg:text-[6.5rem] font-[930] 
           text-red-600 text-center px-4 leading-none font-homeTitle"
        >
          <span className="block sm:inline">The </span>
          <span className="block sm:inline -mt-[1.2rem]">Extended</span>
          <span className="block -mt-[0.7rem] sm:-mt-[1.2rem] md:-mt-[1.5rem] lg:-mt-[1.9rem] 
                       ml-[0.8rem] xs:ml-[0.6rem] sm:ml-[0.8rem] md:ml-[0.8rem] lg:ml-[1rem]">
            Bandoneon
          </span>
        </h1>
      </motion.div>
    </div>
  );
}
