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

type ProgrammeNotes = {
  title: string;
  text: string;
};

type Acknowledgements = {
  title: string;
  text: string;
};

type LanguageSwitch = {
  en: string;
  es: string;
  fi: string;
};

type ProgrammeContent = {
  title: string;
  subtitle: string;
  description: string;
  introduction: string;
  programmeNotes?: ProgrammeNotes;
  scenes: Scene[];
  closing: string;
  concertDetails?: ConcertDetails;
  acknowledgements?: Acknowledgements;
  button: string;
  languageSwitch: LanguageSwitch;
};

export default function ProgrammePage() {
  // State for language selection (default to English)
  const [language, setLanguage] = useState<'en' | 'fi' | 'es'>('en');
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

  // Change language to the selected option
  const changeLanguage = (newLanguage: 'en' | 'fi' | 'es') => {
    setLanguage(newLanguage);
  };

  if (isLoading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Language switcher */}
      <div className="flex justify-end mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              language === 'en'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {content.languageSwitch.en}
          </button>
          <button
            onClick={() => changeLanguage('fi')}
            className={`px-4 py-2 text-sm font-medium ${
              language === 'fi'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {content.languageSwitch.fi}
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              language === 'es'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {content.languageSwitch.es}
          </button>
        </div>
      </div>

      {/* Hero section */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-200 font-heading">{content.title}</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-fuchsia-300 font-heading">{content.subtitle}</h2>
        <p className="text-xl text-gray-300 mb-8 font-body">{content.description}</p>
        <div className="text-gray-300 mb-8 font-body leading-relaxed">
          {content.introduction && <p>{content.introduction}</p>}
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

      {/* Programme Notes */}
      {content.programmeNotes && (
        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">{content.programmeNotes.title}</h2>
          <div className="text-gray-300 mb-8 font-body leading-relaxed">
            {content.programmeNotes.text.split('\n\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-4' : ''}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* Scenes */}
      <div className="space-y-12 mb-16">
        {content.scenes.map((scene, index) => (
          <section key={index}>
            <h2 className="text-xl font-bold mb-4 text-gray-300">{scene.title}</h2>
            <div className="text-gray-300 font-body leading-relaxed">
              <p>{scene.text}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Closing */}
      <section className="mb-16">
        <div className="text-gray-300 font-body leading-relaxed">
          <p className="italic">{content.closing}</p>
        </div>
      </section>

      {/* Acknowledgements */}
      {content.acknowledgements && (
        <section className="mb-16">
          <h2 className="text-2xl font-display mb-4 text-fuchsia-300">{content.acknowledgements.title}</h2>
          <div className="text-gray-300 font-body leading-relaxed">
            <p>{content.acknowledgements.text}</p>
          </div>
        </section>
      )}

      {/* Button to Extended Bandoneon */}
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
