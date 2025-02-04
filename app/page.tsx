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
      <div className="relative z-10 flex items-end justify-center min-h-screen pb-4 xs:pb-10">
        <h1 className="text-[3.5rem] xs:text-[2.6rem] sm:text-[4rem] md:text-[6rem] lg:text-[7rem] font-[930] 
             text-red-600 text-center px-4 leading-none font-[Arial_Black,Impact,sans-serif]">
          <span className="block xs:mt-0 sm:-mt-2 md:-mt-3 lg:-mt-3">The Extended</span>
          <span className="block -mt-[6rem] xs:-mt-3 sm:-mt-5 md:-mt-6 lg:-mt-8 
                         ml-[0.8rem] xs:ml-[0.6rem] sm:ml-[0.8rem] md:ml-[1rem] lg:ml-[1rem]">
            Bandoneon
          </span>
        </h1>
      </div>
    </div>
  );
}
