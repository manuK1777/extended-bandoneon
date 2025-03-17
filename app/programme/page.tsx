'use client';

import { useState, useEffect } from 'react';

// Type definitions for our programme content
type Scene = {
  title: string;
  text: string;
};

type ConcertDetails = {
  title: string;
  dateTime: {
    title: string;
    date: string;
    sets: string[];
  };
  venue: {
    title: string;
    name: string;
  };
  performer: {
    title: string;
    name: string;
  };
  about: {
    title: string;
    text: string;
  };
};

type ProgrammeContent = {
  title: string;
  subtitle: string;
  description: string;
  introduction: string;
  scenes: Scene[];
  closing: string;
  concertDetails?: ConcertDetails;
  button: string;
  languageSwitch: string;
};

export default function ProgrammePage() {
  // State for language selection (default to English)
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [content, setContent] = useState<ProgrammeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the content based on the selected language
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Dynamic import of the JSON file based on language
        const programmeContent = await import(`../../locales/${language}/programme.json`);
        setContent(programmeContent);
      } catch (error) {
        console.error('Failed to load programme content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [language]);

  // Toggle language between English and Spanish
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  if (isLoading || !content) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-yellow-200">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-12 max-w-4xl">
      {/* Language switcher */}
      <div className="flex justify-end mb-8">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-fuchsia-900/50 hover:bg-fuchsia-800/50 text-yellow-200 rounded-md transition-colors duration-200"
        >
          {content.languageSwitch}
        </button>
      </div>

      {/* Hero section */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-200 font-heading">{content.title}</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-fuchsia-300 font-heading">{content.subtitle}</h2>
        <p className="text-xl text-gray-300 mb-8 font-body">{content.description}</p>
        <div className="text-gray-300 font-body space-y-4 leading-relaxed">
          <p className="mb-4">{content.introduction}</p>
        </div>
      </section>

      {/* Concert Details */}
      {content.concertDetails && (
        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">{content.concertDetails.title}</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-300">{content.concertDetails.dateTime.title}</h3>
              <p className="text-gray-300 mb-2">{content.concertDetails.dateTime.date}</p>
              <ul className="list-none m-0 p-0 text-gray-300">
                {content.concertDetails.dateTime.sets.map((set, index) => (
                  <li key={index} className="mb-2">{set}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-300">{content.concertDetails.venue.title}</h3>
              <p className="text-gray-300">{content.concertDetails.venue.name}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-300">{content.concertDetails.performer.title}</h3>
              <p className="text-gray-300">{content.concertDetails.performer.name}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-300">{content.concertDetails.about.title}</h3>
              <p className="text-gray-300">{content.concertDetails.about.text}</p>
            </div>
          </div>
        </section>
      )}

      {/* Scenes */}
      <div className="space-y-12 mb-16">
        {content.scenes.map((scene, index) => (
          <section key={index} className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-8 rounded-lg">
            <h2 className="text-2xl font-display mb-4 text-fuchsia-300">{scene.title}</h2>
            <div className="text-gray-300 font-body space-y-4 leading-relaxed">
              <p>{scene.text}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Closing */}
      <section className="mb-16">
        <div className="text-gray-300 mx-8 font-body space-y-4 leading-relaxed italic">
          <p className="mb-4">{content.closing}</p>
        </div>
      </section>

      {/* Visit Extended Bandoneon button */}
      <div className="flex justify-center">
        <a
          href="https://extendedbandoneon.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-md transition-all duration-200 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none shadow-md hover:shadow-lg shadow-yellow-300/50"
        >
          {content.button}
        </a>
      </div>
    </div>
  );
}
