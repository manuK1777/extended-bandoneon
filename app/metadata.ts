import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Extended Bandoneon | Explore Bandoneon Extended Techniques',
  description: 'A website exploring extended bandoneon techniques, featuring sound samples, articles, techniques, and resources for musicians and researchers.',
  keywords: ['bandoneon', 'extended techniques', 'contemporary music', 'bandoneon sounds', 'bandoneon resources'],
  alternates: {
    canonical: 'https://extendedbandoneon.com',
  },
  openGraph: {
    title: 'Extended Bandoneon',
    description: 'A website exploring extended bandoneon techniques.',
    type: 'website',
    url: 'https://extendedbandoneon.com',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'Extended Bandoneon',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Extended Bandoneon',
    description: 'A website exploring extended bandoneon techniques.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// JSON-LD structured data for the homepage
export const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Extended Bandoneon",
  "url": "https://extendedbandoneon.com",
  "description": "A website exploring extended bandoneon techniques, featuring sound samples, articles, techniques, and resources for musicians and researchers.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://extendedbandoneon.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};
