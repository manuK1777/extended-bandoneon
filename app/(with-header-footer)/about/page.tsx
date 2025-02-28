export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero section */}
      <section className="mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">About</h1>
        <div className="text-gray-300 font-body text-lg leading-relaxed">
          <p className="mb-4">
            Welcome! I am Mercedes Krapovickas, a bandoneonist, pianist, composer, and sound artist from Argentina, based in Finland. My work explores the bandoneon&apos;s movement, textures, and expanded possibilities through extended techniques, sound design, and electronics.
          </p>
          <p className="mb-4">
            This platform is dedicated to sharing resources sound banks, extended techniques, and, in the future, a software tool for bandoneon augmentation. My goal is to inspire musicians and sound artists to reimagine the instrument beyond its traditional role.
          </p>
        </div>
      </section>

      {/* Main content sections */}
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">Research & Background</h2>
          <div className="text-gray-300 font-body space-y-4 leading-relaxed">
            <p>
              I am currently pursuing a doctorate at the Sibelius Academy&apos;s Music and Technology Department, where my research, Bandoneon Resonances, examines movement, interaction, and augmentation. I also study avant-garde bandoneon compositions from the 1960s.
            </p>
            <p>
              Beyond research, I have performed across Europe and Argentina, both as a soloist and in interdisciplinary projects, collaborating in dance, theater, and circus productions. My background includes a Master&apos;s in Sound in New Media from Aalto University and studies in electroacoustic composition, musicology, piano, and composition in Argentina and Finland.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">Vision</h2>
          <div className="text-gray-300 font-body space-y-4 leading-relaxed">
            <p>
              This website is a space for experimentation and exploration for those curious about reimagining the bandoneon!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">Acknowledgments</h2>
          <div className="text-gray-300 font-body space-y-4 leading-relaxed">
            <p>
              I would like to express my gratitude to those who have supported and contributed to this project:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kone Foundation, for awarding me a one-year working grant to explore the bandoneon in live performances.</li>
              <li>Elektronmusikstudion (EMS), for inviting me as a guest composer, providing the space and resources to record many of the sound banks shared on this site.</li>
              <li>Sibelius Academy, and especially the Music and Technology Department, for their continuous support and for providing a home for my research.</li>
              <li>Manuel Krapovickas, for designing and developing this beautiful website and helping bring this project to life.</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Contact section */}
      <section className="mt-16 bg-white/5 p-8 rounded-lg backdrop-blur-sm">
        <h2 className="text-2xl font-display mb-4 text-yellow-200">Get in Touch</h2>
        <div className="text-gray-300 font-body">
          <p>
            This platform is an evolving space for artistic and technical exploration. For more about my work, visit{' '}
            <a 
              href="http://www.mekrapov.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-fuchsia-400 transition-colors duration-200"
            >
              www.mekrapov.com
            </a>{' '}
            or contact me at{' '}
            <a 
              href="mailto:mekrapov@gmail.com"
              className="text-yellow-500 hover:text-fuchsia-400 transition-colors duration-200"
            >
              mekrapov@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
