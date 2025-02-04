'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const navItems = [
  { name: "Techniques", delay: 1.8 },
  { name: "Soundbank", delay: 2.0 },
  { name: "Articles", delay: 2.2 },
  { name: "Contact", delay: 2.4 },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Image */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 5,
          ease: "easeOut"
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

      {/* Navigation Buttons */}
      <motion.div 
        className="absolute z-20 left-8 top-20 sm:left-12 md:left-16 lg:left-24 flex flex-col gap-3"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        {navItems.map((item) => (
          <motion.button
            key={item.name}
            className="btn btn-md glass text-white w-40 font-body px-2 hover:bg-yellow-200 hover:text-red-500 transition-colors duration-200"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: item.delay,
              ease: "easeOut"
            }}
          >
            {item.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10 flex items-end justify-center min-h-screen pb-10 sm:pb-8 xs:pb-10 lg:pb-0"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <h1 className="text-[3.5rem] text-[4.2rem] xs:text-[4.5rem] sm:text-[5.7rem] md:text-[5.8rem] lg:text-[7rem] font-[930] 
             text-red-600 text-center px-4 leading-none font-[Arial_Black,Impact,sans-serif]">
          <span className="block">The Extended</span>
          <span className="block -mt-[1rem] -mt-[1.2rem] xs:-mt-[1rem] sm:-mt-[1.7rem] md:-mt-[1.8rem] lg:-mt-[2.1rem] 
                         ml-[0.8rem] xs:ml-[0.6rem] sm:ml-[0.8rem] md:ml-[1rem] lg:ml-[1rem]">Bandoneon</span>
        </h1>
      </motion.div>
    </div>
  );
}
