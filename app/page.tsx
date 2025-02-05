"use client";

import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import ResponsiveNav from "../components/navigation/ResponsiveNav";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          The Extended Bandoneon | Bandoneon Techniques & Sound Exploration
        </title>
        <meta
          name="description"
          content="Explore the innovative world of extended bandoneon 
                   techniques, sound banks, and more, redefining the
                   expressive range of the instrument."/>
        <meta property="og:title" content="The Extended Bandoneon"/>
        <meta
          property="og:description"
          content="Explore innovative bandoneon techniques, soundbanks, and articles."
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg"
        />
        <meta property="og:url" content="https://www.extendedbandoneon.com" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Extended Bandoneon" />
        <meta
          name="twitter:description"
          content="Discover bandoneon techniques and sound innovations."
        />
        <meta
          name="twitter:image"
          content="https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg"
        />
      </Head>
      
      <div className="relative h-screen w-full overflow-hidden flex flex-col">
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

        {/* Navigation */}
        <ResponsiveNav />

        {/* Content */}
        <motion.div
          className="relative z-10 flex items-end justify-center min-h-screen pb-[3.5rem] sm:pb-8 lg:pb-[0]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <h1
            className="text-[3rem] sm:text-[4.3rem] md:text-[4.5rem] lg:text-[6.5rem] font-[930] 
             text-red-600 text-center px-4 leading-none font-[Arial_Black,Impact,sans-serif]"
          >
            <span className="block">The Extended</span>
            <span className="block -mt-[1rem] -mt-[1.2rem] sm:-mt-[1.2rem] md:-mt-[1.5rem] lg:-mt-[1.9rem] 
                         ml-[0.8rem] xs:ml-[0.6rem] sm:ml-[0.8rem] md:ml-[0.8rem] lg:ml-[1rem]">Bandoneon</span>
          </h1>
        </motion.div>
      </div>
    </>
  );
}
