import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Extended Bandoneon Techniques',
  description: 'Explore extended techniques for the bandoneon, including unconventional playing methods, sound production techniques, and innovative approaches.',
  keywords: ['bandoneon techniques', 'extended techniques', 'contemporary bandoneon', 'experimental bandoneon', 'bandoneon playing methods'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/techniques',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Extended Bandoneon Techniques',
    description: 'Explore extended techniques for the bandoneon, including unconventional playing methods and innovative approaches.',
    url: 'https://extendedbandoneon.com/techniques',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'Extended Bandoneon Techniques',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Extended Bandoneon Techniques',
    description: 'Explore extended techniques for the bandoneon, including unconventional playing methods and innovative approaches.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// Define the Technique type
interface Technique {
  title: string;
  description?: string;
  excerpt?: string;
  slug: string;
  publishedAt?: string;
  createdAt?: string;
  author?: string;
  videoUrl?: string;
}

// Generate structured data for techniques collection
export function generateTechniquesStructuredData(techniques: Technique[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Extended Bandoneon Techniques",
    "description": "A collection of extended techniques for the bandoneon",
    "numberOfItems": techniques.length,
    "itemListElement": techniques.map((technique, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "TechArticle",
        "headline": technique.title,
        "description": technique.description || technique.excerpt,
        "url": `https://extendedbandoneon.com/techniques/${technique.slug}`,
        "datePublished": technique.publishedAt || technique.createdAt,
        "author": {
          "@type": "Person",
          "name": technique.author || "Extended Bandoneon"
        },
        ...(technique.videoUrl && {
          "video": {
            "@type": "VideoObject",
            "url": technique.videoUrl
          }
        })
      }
    }))
  };
}
