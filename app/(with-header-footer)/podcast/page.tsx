"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
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
    title: "Episode 4",
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
      "bandonoen contemporaneo",
      "bandoneonperspectives",
      "musica de camara",
      "bandoneon",
      "victorhugovillena",
      "musicos argentinos"
    ]
  },
  {
    title: "Episode 3",
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
    title: "Episode 2",
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
    title: "Episode 1",
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

// Lazy loaded player component
const PodcastPlayer = ({ episode, onLoad }: { episode: Episode; onLoad: () => void }) => {
  // Add parameters to prevent automatic app opening while keeping dark theme and share button
  const enhancedUrl = `${episode.url}&hide_redirect=1&dark=1`;
  
  return (
    <iframe
      className="absolute top-0 left-0 w-full h-full border-0 overflow-hidden"
      seamless
      src={enhancedUrl}
      title={`Bandoneon Perspectives with ${episode.guest}`}
      aria-label={`Podcast player for episode with ${episode.guest}`}
      onLoad={onLoad}
      sandbox="allow-same-origin allow-scripts allow-popups"
    />
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse bg-gray-200 w-full h-full rounded-md" />
);

const EpisodePlayer = ({ episode }: { episode: Episode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    const element = document.getElementById(`episode-${episode.episodeNumber}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [episode.episodeNumber]);

  return (
    <article 
      id={`episode-${episode.episodeNumber}`}
      className="podcast-episode"
      itemScope 
      itemType="https://schema.org/PodcastEpisode"
    >
      <div className="w-[70%] mx-auto mb-4">
        <h2 className="text-2xl font-display mb-2" itemProp="name">
          {episode.title}
        </h2>
        <p className="text-gray-600 text-justify" itemProp="description">{episode.description}</p>
      </div>
      <div className="relative w-[70%] h-52 md:h-64 mx-auto">
        {isVisible ? (
          <>
            <PodcastPlayer episode={episode} onLoad={() => setIsLoaded(true)} />
            {!isLoaded && <LoadingSkeleton />}
          </>
        ) : (
          <LoadingSkeleton />
        )}
        <meta itemProp="episodeNumber" content={episode.episodeNumber} />
        <meta itemProp="datePublished" content={episode.publishDate} />
      </div>
    </article>
  );
};

type SortOrder = 'newest' | 'oldest';

const sortOptions = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'oldest' as const, label: 'Oldest First' }
];

export default function PodcastPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Enhanced search functionality
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
        <header>
          <h1 className="text-4xl font-bold mb-8">Bandoneon Perspectives</h1>
          <p className="text-xl font-semibold mb-[4rem] md:mb-[7rem]">
            A podcast to unfold contemporary bandoneon stories. This is a space to talk about things related to the bandoneon.
          </p>
        </header>

        <FilterSection<SortOrder>
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortOptions={sortOptions}
          placeholder="Search episodes, guests, or topics..."
          sortLabel="Sort by:"
        />

        <section className="space-y-9 mt-[4rem]" aria-label="Podcast Episodes">
          {filteredAndSortedEpisodes.length > 0 ? (
            filteredAndSortedEpisodes.map((episode) => (
              <EpisodePlayer key={episode.episodeNumber} episode={episode} />
            ))
          ) : (
            <p className="text-center text-gray-600">No episodes found matching your search.</p>
          )}
        </section>
      </main>
    </>
  );
}
