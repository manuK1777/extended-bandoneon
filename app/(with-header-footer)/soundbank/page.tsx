'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from "next/head";

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
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSoundpack, setSelectedSoundpack] = useState("");
  const [currentSound, setCurrentSound] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sounds')
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'Failed to fetch sounds');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setSounds(data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching sounds:', error);
        setError(error.message);
        setSounds([]);
      });
  }, []);

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
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          <p className="font-medium">Error loading sounds:</p>
          <p>{error}</p>
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading tracking-tight">Bandoneon Soundbank</h1>
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
                  aria-pressed={selectedTags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-yellow-300 text-cyan-900 border-2 border-red-300 font-medium shadow-lg scale-105'
                      : 'bg-cyan-900 text-yellow-300 border border-red-300 hover:bg-cyan-800 hover:scale-102'
                  }`}
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
                className="w-full max-w-xs px-3 py-2 rounded border border-gray-300"
                aria-label="Select soundpack"
              >
                <option value="">All Soundpacks</option>
                {allSoundpacks.map((pack) => (
                  <option key={pack} value={pack || ""}>{pack}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Sound List */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Sound samples">
          {filteredSounds.map((sound) => (
            <article
              key={sound.id}
              className={`p-6 rounded-lg space-y-4 transition-colors duration-200 ${
                currentSound === sound.id
                  ? 'bg-gradient-to-b from-white/10 to-white/15 backdrop-blur-sm'
                  : 'bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15'
              }`}
            >
              <div className="space-y-3">
                <h3 className="font-heading tracking-tight text-xl">{sound.title}</h3>
                {sound.description && (
                  <p className="text-gray-300 text-sm">{sound.description}</p>
                )}
              </div>

              <div className="bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-sm rounded-lg p-4">
                <SoundPlayer 
                  fileUrl={sound.fileUrl} 
                  onReady={() => setCurrentSound(sound.id)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Duration: {formatDuration(sound.duration)}</span>
                  <span>Size: {formatFileSize(sound.fileSize)}</span>
                </div>

                {sound.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sound.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-cyan-900 text-yellow-300 border border-red-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {sound.soundpackName && (
                  <div className="text-sm">
                    <p className="text-yellow-200 font-display">
                      Pack: {sound.soundpackName}
                    </p>
                    {sound.soundpackDescription && (
                      <p className="text-gray-400 text-xs mt-1">
                        {sound.soundpackDescription}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-400 font-mono">
                  Added: {new Date(sound.createdAt).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
