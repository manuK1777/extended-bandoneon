import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Bandoneon Perspectives Podcast | Contemporary Bandoneon Stories',
  description: 'Listen to in-depth conversations with renowned bandoneon players like Victor Hugo Villena, Kristina Kuusisto, Eszter Vörös, and Simone Van Der Weerden. Explore contemporary bandoneon techniques, stories, and music.',
  alternates: {
    canonical: 'https://extendedbandoneon.com/podcast',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Bandoneon Perspectives Podcast | Contemporary Bandoneon Stories',
    description: 'Listen to in-depth conversations with renowned bandoneon players. Explore contemporary bandoneon techniques, stories, and music.',
    url: 'https://extendedbandoneon.com/podcast',
    images: [
      {
        url: 'https://extendedbandoneon.com/images/podcast-cover.jpg',
        alt: 'Bandoneon Perspectives Podcast Cover',
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Bandoneon Perspectives Podcast',
    description: 'Listen to in-depth conversations with renowned bandoneon players. Explore contemporary bandoneon techniques, stories, and music.',
    images: ['https://extendedbandoneon.com/images/podcast-cover.jpg'],
  },
};

// JSON-LD structured data for podcast
export const podcastStructuredData = {
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
};
