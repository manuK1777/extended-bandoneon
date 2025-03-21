'use client';

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
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="w-[90%] md:w-[70%] mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-yellow-200 font-heading">Bandoneon Perspectives</h1>
        <p className="text-[0.875rem] md:text-lg text-left mb-[1rem] md:mb-[2rem] font-body tracking-normal text-gray-300">
          A podcast to unfold contemporary bandoneon stories. This is a space to talk about things related to the bandoneon.
        </p>
      </header>

      <FilterSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortOptions={sortOptions}
        containerClassName="mb-8 w-[90%] md:w-[70%] mx-auto font-body"
        placeholder="Search episodes..."
        sortLabel="Sort by:"
      />

      <div className="w-[90%] lg:w-[70%] mx-auto space-y-8">
        {filteredAndSortedEpisodes.map((episode) => (
          <div
            key={episode.episodeNumber}
            className="relative bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-6 rounded-lg space-y-4 transition-colors duration-200 hover:from-white/10 hover:to-white/15"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl md:text-2xl font-heading tracking-tight">
                {episode.title}
                <span className="text-yellow-400 font-display ml-2">#{episode.episodeNumber}</span>
              </h2>
              <time className="text-xs md:text-sm text-gray-400 font-mono">
                {new Date(episode.publishDate).toLocaleDateString()}
              </time>
            </div>
            
            <div className="font-body">
              <p className="text-sm md:text-base text-gray-300">{episode.description}</p>
              <p className="mt-2 text-sm md:text-base text-fuchsia-200 font-display">Guest: {episode.guest}</p>
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

            <div className="mt-6">
              {/* Static background container - always visible */}
              <div className="relative min-h-[200px] bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-sm rounded-lg overflow-hidden">
                {/* Loading state container */}
                {!loadedPlayers[episode.episodeNumber] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
                    <div className="text-sm text-gray-400">Loading player...</div>
                  </div>
                )}
                {/* Player iframe */}
                <iframe
                  src={episode.url}
                  height="200px"
                  width="100%"
                  seamless
                  sandbox="allow-same-origin allow-scripts allow-popups"
                  className={`w-full transition-opacity duration-300 ${
                    loadedPlayers[episode.episodeNumber] ? 'opacity-100' : 'opacity-0'
                  }`}
                  title={`${episode.title} - Episode ${episode.episodeNumber}`}
                  onLoad={() => handlePlayerLoad(episode.episodeNumber)}
                  loading="lazy"
                  referrerPolicy="origin"
                  allow="web-share"
                  data-podcast-player="true"
                  data-prevent-app-launch="true"
                ></iframe>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
