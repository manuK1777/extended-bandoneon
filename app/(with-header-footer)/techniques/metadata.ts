import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Extended Techniques | Extended Bandoneon',
  description: 'Explore a collection of extended techniques for the bandoneon, with detailed explanations, examples, and media resources.',
  keywords: ['bandoneon techniques', 'extended techniques', 'contemporary bandoneon', 'experimental music', 'bandoneon performance'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/techniques',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Bandoneon Extended Techniques',
    description: 'Explore a collection of extended techniques for the bandoneon.',
    url: 'https://extendedbandoneon.com/techniques',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'Bandoneon Extended Techniques',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Bandoneon Extended Techniques',
    description: 'Explore a collection of extended techniques for the bandoneon.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// Generate structured data for techniques collection
export function generateTechniquesStructuredData(techniques: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Bandoneon Extended Techniques",
    "description": "A collection of extended techniques for the bandoneon",
    "numberOfItems": techniques.length,
    "itemListElement": techniques.map((technique, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "TechArticle",
        "name": technique.title,
        "description": technique.description,
        "url": `https://extendedbandoneon.com/techniques/${technique.slug}`
      }
    }))
  };
}
