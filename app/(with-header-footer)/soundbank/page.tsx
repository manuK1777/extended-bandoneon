'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

// Lazy load the SoundPlayer component
const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), {
  ssr: false,
});

interface Sound {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileFormat: 'mp3' | 'wav' | 'flac' | 'ogg' | 'aac' | 'aiff' | null;
  duration: number | null;
  fileSize: number | null;
  createdAt: string;
  soundpackName: string | null;
  soundpackDescription: string | null;
  tags: string[];
  author?: string;
  license?: string;
  downloadCount?: number;
}

interface SoundResponse {
  sounds: Sound[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface FetchSoundsParams {
  pageParam?: string | null;
  limit?: number;
}

async function fetchSounds({ pageParam, limit = 12 }: FetchSoundsParams): Promise<SoundResponse> {
  const params = new URLSearchParams();
  if (pageParam) params.append('cursor', pageParam);
  params.append('limit', limit.toString());
  
  const response = await fetch(`/api/sounds?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sounds');
  }
  return response.json();
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function SoundbankPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSoundpack, setSelectedSoundpack] = useState("");
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  
  // Infinite query for sounds
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['sounds'],
    queryFn: ({ pageParam = null }) => fetchSounds({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten and filter sounds
  const sounds = data?.pages.flatMap(page => page.sounds) ?? [];
  
  // Get unique tags and soundpacks for filters
  const allTags = Array.from(new Set(sounds?.flatMap(s => s.tags || []).filter(Boolean) || []));
  const allSoundpacks = Array.from(new Set(sounds?.map(s => s.soundpackName).filter((name): name is string => name !== null) || []));

  // Filter sounds based on selected tags and soundpack
  const filteredSounds = sounds.filter(sound => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => sound.tags.includes(tag));
    const matchesSoundpack = !selectedSoundpack || 
      sound.soundpackName === selectedSoundpack;
    return matchesTags && matchesSoundpack;
  });

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Extended Bandoneon Soundbank",
    "description": "Collection of high-quality bandoneon sound samples",
    "numberOfItems": filteredSounds.length,
    "hasPart": filteredSounds.map(sound => ({
      "@type": "AudioObject",
      "name": sound.title,
      "description": sound.description || undefined,
      "duration": sound.duration ? `PT${Math.floor(sound.duration)}S` : undefined,
      "contentSize": sound.fileSize || undefined,
      "encodingFormat": sound.fileFormat || undefined,
      "datePublished": sound.createdAt
    }))
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {status === 'error' && (
        <div className="mb-4 p-4 text-red-700" role="alert">
          <p className="font-medium">Error loading sounds:</p>
          <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      )}
      
      <Head>
        <title>Extended Bandoneon Soundbank - Free Bandoneon Sound Samples</title>
        <meta name="description" content="Explore our collection of high-quality bandoneon sound samples. Download free sounds for music production, research, and creative projects." />
        <meta name="keywords" content="bandoneon sounds, bandoneon samples, free bandoneon sounds, music production, sound library" />
      </Head>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="mb-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading tracking-tight">
            Bandoneon Soundbank
          </h1>
        </header>

        {/* Filters */}
        <section className="mb-8 space-y-4" aria-label="Sound filters">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">Filter by Tags</h2>
              <span className="text-sm text-gray-400" role="status" aria-live="polite">
                {filteredSounds.length} {filteredSounds.length === 1 ? 'sound' : 'sounds'} found
              </span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Tag filters">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  aria-pressed={selectedTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {allSoundpacks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Filter by Soundpack</h2>
              <select
                value={selectedSoundpack}
                onChange={(e) => setSelectedSoundpack(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-gray-700 rounded-md text-white border-gray-600 focus:border-red-500 focus:ring-red-500"
                aria-label="Select soundpack"
              >
                <option value="">All Soundpacks</option>
                {allSoundpacks.map((pack) => (
                  <option key={pack} value={pack}>
                    {pack}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-1">{sound.title}</h3>
                {sound.soundpackName && (
                  <p className="text-sm text-gray-400 mb-2">
                    From: {sound.soundpackName}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  {sound.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Duration: {formatDuration(sound.duration)}</p>
                  <p>Format: {sound.fileFormat || 'Unknown'}</p>
                  <p>Size: {formatFileSize(sound.fileSize)}</p>
                </div>
              </div>

              <SoundPlayer
                fileUrl={sound.fileUrl}
                onReady={() => {
                  // Handle player ready
                }}
              />
            </div>
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        <div ref={ref} className="mt-8 text-center">
          {isFetchingNextPage ? (
            <p className="text-gray-400">Loading more sounds...</p>
          ) : hasNextPage ? (
            <p className="text-gray-400">Load more sounds as you scroll</p>
          ) : (
            <p className="text-gray-400">No more sounds to load</p>
          )}
        </div>
      </main>
    </div>
  );
}
