import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Extended Bandoneon Soundbank - Free Bandoneon Sound Samples',
  description: 'Explore our collection of high-quality bandoneon sound samples. Download free sounds for music production, research, and creative projects.',
  keywords: ['bandoneon sounds', 'bandoneon samples', 'free bandoneon sounds', 'music production', 'sound library', 'bandoneon soundbank'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/soundbank',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Extended Bandoneon Soundbank',
    description: 'Collection of high-quality bandoneon sound samples for music production and creative projects.',
    url: 'https://extendedbandoneon.com/soundbank',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'Extended Bandoneon Soundbank',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Extended Bandoneon Soundbank',
    description: 'Collection of high-quality bandoneon sound samples for music production and creative projects.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// This function generates structured data for the soundbank page
// It takes the sounds array as input to create a dynamic collection page schema
export function generateSoundbankStructuredData(sounds: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Extended Bandoneon Soundbank",
    "description": "Collection of high-quality bandoneon sound samples",
    "numberOfItems": sounds.length,
    "hasPart": sounds.map(sound => ({
      "@type": "AudioObject",
      "name": sound.title,
      "description": sound.description || undefined,
      "duration": sound.duration ? `PT${Math.floor(sound.duration)}S` : undefined,
      "contentSize": sound.fileSize || undefined,
      "encodingFormat": sound.fileFormat || undefined,
      "datePublished": sound.createdAt
    }))
  };
}
