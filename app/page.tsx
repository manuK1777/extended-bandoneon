import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Image */}
      <div className="absolute inset-0">
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
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end justify-center min-h-screen pb-10 sm:pb-8 xs:pb-10 lg:pb-0">
        <h1 className="text-[3.5rem] text-[4.2rem] xs:text-[4.5rem] sm:text-[5.7rem] md:text-[5.8rem] lg:text-[7rem] font-[930] 
             text-red-600 text-center px-4 leading-none font-[Arial_Black,Impact,sans-serif]">
          <span className="block">The Extended</span>
          <span className="block -mt-[1rem] -mt-[1.2rem] xs:-mt-[1rem] sm:-mt-[1.7rem] md:-mt-[1.8rem] lg:-mt-[2.1rem] 
                         ml-[0.8rem] xs:ml-[0.6rem] sm:ml-[0.8rem] md:ml-[1rem] lg:ml-[1rem]">Bandoneon</span>
        </h1>
      </div>
    </div>
  );
}
