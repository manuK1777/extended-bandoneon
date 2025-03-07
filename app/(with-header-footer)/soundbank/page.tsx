'use client';

import React, { useState, useEffect, Fragment } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Listbox, Transition, ListboxOption, ListboxButton, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

// Lazy load the SoundPlayer component
const SoundPlayer = dynamic(() => import('@/components/SoundPlayer'), {
  ssr: false,
});

interface Sound {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  wavUrl: string;
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

interface Filters {
  tags: string[];
  soundpacks: string[];
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
  const data = await response.json();
  return data; // The API already returns data in the correct format
}

async function fetchFilters(): Promise<Filters> {
  const response = await fetch('/api/filters');
  if (!response.ok) {
    throw new Error('Failed to fetch filters');
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
  const [tagSearch, setTagSearch] = useState<string | null>(null);
  
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

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

  // Query for filters
  const { data: filtersData } = useQuery({
    queryKey: ['filters'],
    queryFn: fetchFilters
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView();

  // Use inView to trigger fetchNextPage
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten and filter sounds
  const sounds = data?.pages.flatMap(page => page.sounds) ?? [];
  
  // Get unique tags and soundpacks from filters data
  const allTags = filtersData?.tags ?? [];
  const allSoundpacks = filtersData?.soundpacks ?? [];

  // Filter sounds based on selected tags and soundpack
  const filteredSounds = sounds.filter(sound => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => sound.tags.includes(tag));
  
    const matchesSoundpack = !selectedSoundpack || 
      sound.soundpackName === selectedSoundpack;
  
    const isMp3 = sound.fileUrl?.includes('/soundbank/mp3/');
  
    return matchesTags && matchesSoundpack && isMp3;
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
    <div className="container w-[90%] mx-auto px-4 py-8">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">
            Bandoneon Soundbank
          </h1>
        </header>

        {/* Filters */}
        <section className="mb-8" aria-label="Sound filters">
          <div className="flex flex-col md:flex-row items-start gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              {allSoundpacks.length > 0 && (
                <div className="w-full md:w-64">
                  <h3 className="text-base font-medium mb-2">Filter by Soundpack</h3>
                  <Listbox value={selectedSoundpack} onChange={setSelectedSoundpack}>
                    {() => (
                      <div className="relative">
                        <ListboxButton className="text-sm w-full cursor-pointer py-2 pl-3 pr-10 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-cyan-900 text-white">
                          <span className="block truncate">
                            {selectedSoundpack || 'All Soundpacks'}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </ListboxButton>

                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <ListboxOptions className="text-sm absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-cyan-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <ListboxOption
                              key="all-soundpacks"
                              value=""
                              className={({ selected }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  selected ? 'bg-red-500 text-white' : 'text-white bg-cyan-900'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal bg-cyan-900'}`}>
                                    All Soundpacks
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </ListboxOption>
                            {allSoundpacks.sort().map((pack) => (
                              <ListboxOption
                                key={`soundpack-${pack}`}
                                value={pack}
                                className={({ selected }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 bg-cyan-900 ${
                                    selected ? 'bg-red-500 text-white' : 'text-white hover:bg-red-400'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {pack}
                                    </span>
                                    {selected && (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                </div>
              )}

              <div className="w-full md:w-64">
                <h3 className="text-base font-medium mb-2">Filter by Tags</h3>
                <div className="relative">
                  <Listbox value={selectedTags} onChange={setSelectedTags} multiple>
                    {() => (
                      <div className="relative">
                        <ListboxButton className="text-sm w-full cursor-pointer py-2 pl-3 pr-10 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 bg-cyan-900 text-white">
                          <span className="block truncate">
                            {selectedTags.length === 0
                              ? 'Select tags...'
                              : `${selectedTags.length} tag(s) selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </ListboxButton>

                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setTagSearch(null)}
                        >
                          <ListboxOptions className="text-sm absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-cyan-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-3 py-2 bg-gray-700 border-b border-gray-600">
                              <input
                                type="text"
                                className="w-full bg-gray-600 text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Search tags..."
                                onChange={(e) => setTagSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {allTags
                              .sort()
                              .filter((tag) => tag.toLowerCase().includes(tagSearch?.toLowerCase() || ''))
                              .map((tag) => (
                                <ListboxOption
                                  key={`tag-${tag}`}
                                  value={tag}
                                  className={({ selected }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      selected ? 'bg-red-500 text-white' : 'text-white hover:bg-red-400'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {tag}
                                      </span>
                                      {selected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="absolute -right-20 top-0 px-3 py-2 bg-cyan-900 text-yellow-200 rounded-md border border-gray-600 hover:bg-cyan-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                      aria-label="Clear selected tags"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-400 md:mt-12 mr-4 block" role="status" aria-live="polite">
              {filteredSounds.length} {filteredSounds.length === 1 ? 'sound' : 'sounds'} found
            </span>
          </div>
        </section>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="rounded-lg p-4 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm transition-colors duration-200 hover:from-white/10 hover:to-white/15"
            >
              <div className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-medium text-white">{sound.title}</h3>
                  <details className="dropdown dropdown-end">
                    <summary 
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors list-none cursor-pointer"
                      title="Download options"
                    >
                      <Download size={18} />
                    </summary>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-40">
                      <li key="wav-download">
                        <button
                          onClick={(e) => {
                            (e.target as HTMLElement).closest('details')?.removeAttribute('open');
                            downloadFile(sound.wavUrl, `${sound.title}.wav`);
                          }}
                          className="text-sm"
                        >
                          Download WAV
                        </button>
                      </li>
                      <li key="mp3-download">
                        <button
                          onClick={(e) => {
                            (e.target as HTMLElement).closest('details')?.removeAttribute('open');
                            downloadFile(sound.fileUrl, `${sound.title}.mp3`);
                          }}
                          className="text-sm"
                        >
                          Download MP3
                        </button>
                      </li>
                    </ul>
                  </details>
                </div>
                {sound.soundpackName && (
                  <p className="text-sm text-fuchsia-200 mb-2">
                    Soundpack: {sound.soundpackName}
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
          {status === 'pending' ? (
            <p className="text-gray-400">Loading sounds...</p>
          ) : isFetchingNextPage ? (
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
