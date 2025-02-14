"use client";

import Head from "next/head";
import { useState } from "react";
import { FilterSection } from "@/components/FilterSection";

interface Episode {
  title: string;
  url: string;
  episodeNumber: string;
  publishDate: string;
  guest: string;
  description: string;
  keywords: string[];
}

const episodes: Episode[] = [
  {
    title: "Episode",
    url: "https://player.simplecast.com/8ff796b2-1bf7-4e90-8954-0ad254cf808b?dark=true",
    episodeNumber: "4",
    publishDate: "2024-05-12T00:00:00.000Z",
    guest: "Victor Hugo Villena",
    description: "Víctor shares his fascinating journey with this unique instrument, from his beginnings to the present day.",
    keywords: [
      "contemporary music",
      "tango",
      "chamber music",
      "victorvillena",
      "bandoneon contemporaneo",
      "bandoneon perspectives",
      "musica de camara",
      "bandoneon",
      "victor hugo villena",
      "musicos argentinos"
    ]
  },
  {
    title: "Episode",
    url: "https://player.simplecast.com/2028d5cf-0a24-4bd8-bba2-b96af6cdd697?dark=true",
    episodeNumber: "3",
    publishDate: "2021-11-16T00:00:00.000Z",
    guest: "Kristina Kuusisto",
    description: "A talk with Kristina Kuusisto, a multifaceted artist, who explores the possibilities of the bandoneon in different musical genres.",
    keywords: [
      "hurdy-gurdy",
      "contemporary music",
      "tango",
      "new music for bandoneon",
      "music",
      "accordion",
      "bandoneon",
      "musician",
      "renaissance music",
      "bandoneon perspectives",
      "bellow art",
      "kristina kuusisto"
    ]
  },
  {
    title: "Episode",
    url: "https://player.simplecast.com/8b7bf23d-29b2-466c-89a8-b484e7a38616?dark=true",
    episodeNumber: "2",
    publishDate: "2021-06-13T00:00:00.000Z",
    guest: "Eszter Vörös",
    description: "Eszter Vörös is a pioneer of the bandoneon in Hungary. In this episode, we talk to her about her latest projects",
    keywords: [
      "musica",
      "tango",
      "esztervörös",
      "victorvillena",
      "jánosmásik",
      "fantasiasparabandoneon",
      "gabrielgarciamarquez",
      "hungria",
      "bandoneon",
      "gabo"
    ]
  },
  {
    title: "Episode",
    url: "https://player.simplecast.com/c3775b72-a397-4e59-bf33-c5e5d3b76a8e?dark=true",
    episodeNumber: "1",
    publishDate: "2021-05-25T00:00:00.000Z",
    guest: "Simone Van Der Weerden",
    description: "We talked with Simone van der Weerden about her life as a bandoneonist in the Netherlands and about her new projecs.",
    keywords: [
      "bandoneon",
      "jazz",
      "tango",
      "rotterdam",
      "female composer",
      "female bandoneonist",
      "modern tango",
      "composer",
      "jazz",
      "improvisation",
      "performer",
      "simone van der weerden"
    ]
  },
];

type SortOrder = 'newest' | 'oldest';

const sortOptions = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'oldest' as const, label: 'Oldest First' }
];

export default function PodcastPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [loadedPlayers, setLoadedPlayers] = useState<Record<string, boolean>>({});

  // Handle iframe load events
  const handlePlayerLoad = (episodeNumber: string) => {
    setLoadedPlayers(prev => ({
      ...prev,
      [episodeNumber]: true
    }));
  };

  const filteredAndSortedEpisodes = episodes
    .filter(episode => {
      const searchLower = searchQuery.toLowerCase();
      return (
        episode.title.toLowerCase().includes(searchLower) ||
        episode.guest.toLowerCase().includes(searchLower) ||
        episode.description.toLowerCase().includes(searchLower) ||
        episode.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        )
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishDate).getTime();
      const dateB = new Date(b.publishDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      <Head>
        <title>Bandoneon Perspectives Podcast | Contemporary Bandoneon Stories</title>
        <meta name="description" content="Listen to in-depth conversations with renowned bandoneon players like Victor Hugo Villena, Kristina Kuusisto, Eszter Vörös, and Simone Van Der Weerden. Explore contemporary bandoneon techniques, stories, and music." />
        <link rel="canonical" href="https://extendedbandoneon.com/podcast" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PodcastSeries",
            "name": "Bandoneon Perspectives",
            "description": "A podcast to unfold contemporary bandoneon stories and discussions",
            "url": "https://extendedbandoneon.com/podcast",
            "author": {
              "@type": "Person",
              "name": "Mercedes Krapovickas"
            },
            "inLanguage": ["en", "es"],
            "keywords": "bandoneon, tango, music",
          })}
        </script>

        <meta property="og:title" content="Bandoneon Perspectives Podcast | Contemporary Bandoneon Stories" />
        <meta property="og:description" content="Listen to in-depth conversations with renowned bandoneon players. Explore contemporary bandoneon techniques, stories, and music." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://extendedbandoneon.com/podcast" />
        <meta property="og:image" content="https://extendedbandoneon.com/images/podcast-cover.jpg" />
        <meta property="og:image:alt" content="Bandoneon Perspectives Podcast Cover" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bandoneon Perspectives Podcast" />
        <meta name="twitter:description" content="Listen to in-depth conversations with renowned bandoneon players. Explore contemporary bandoneon techniques, stories, and music." />
        <meta name="twitter:image" content="https://extendedbandoneon.com/images/podcast-cover.jpg" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <header className="w-[90%] md:w-[70%] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading tracking-tight">Bandoneon Perspectives</h1>
          <p className="text-base md:text-lg text-justify mb-[3rem] md:mb-[6rem] font-body tracking-normal text-gray-300">
            A podcast to unfold contemporary bandoneon stories. This is a space to talk about things related to the bandoneon.
          </p>
        </header>

        <FilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortOptions={sortOptions}
          containerClassName="mb-8 w-[70%] sm:w-[80%] md:w-[70%] mx-auto font-body"
          placeholder="Search episodes..."
          sortLabel="Sort by:"
        />

        <div className="w-[90%] md:w-[70%] mx-auto space-y-8">
          {filteredAndSortedEpisodes.map((episode) => (
            <div
              key={episode.episodeNumber}
              className="bg-white/5 p-6 rounded-lg space-y-4 hover:bg-white/10 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl md:text-2xl font-heading tracking-tight">
                  {episode.title}
                  <span className="text-yellow-200 font-display ml-2">#{episode.episodeNumber}</span>
                </h2>
                <time className="text-xs md:text-sm text-gray-400 font-mono">
                  {new Date(episode.publishDate).toLocaleDateString()}
                </time>
              </div>
              
              <div className="font-body">
                <p className="text-sm md:text-base text-gray-300">{episode.description}</p>
                <p className="mt-2 text-sm md:text-base text-yellow-200 font-display">Guest: {episode.guest}</p>
              </div>

              <div className="flex flex-wrap gap-1 md:gap-2">
                {episode.keywords.map((keyword, index) => (
                  <span
                    key={`${episode.episodeNumber}-${keyword}-${index}`}
                    className="px-1.5 py-0.5 md:px-2 md:py-1 bg-white/10 rounded text-[10px] md:text-sm font-mono tracking-tight"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="mt-6 relative min-h-[200px]">
                {!loadedPlayers[episode.episodeNumber] && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg flex items-center justify-center">
                    <div className="text-sm text-gray-400">Loading player...</div>
                  </div>
                )}
                <iframe
                  src={episode.url}
                  height="200px"
                  width="100%"
                  seamless
                  className={`w-full transition-opacity duration-500 ${
                    loadedPlayers[episode.episodeNumber] ? 'opacity-100' : 'opacity-0'
                  }`}
                  title={`${episode.title} - Episode ${episode.episodeNumber}`}
                  onLoad={() => handlePlayerLoad(episode.episodeNumber)}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
