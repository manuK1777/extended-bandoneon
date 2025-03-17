import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'About | Extended Bandoneon',
  description: 'Learn about the Extended Bandoneon project, its mission to explore and document contemporary bandoneon techniques, and the team behind it.',
  keywords: ['about extended bandoneon', 'bandoneon project', 'contemporary bandoneon', 'bandoneon research','bandoneon'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/about',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'About Extended Bandoneon',
    description: 'Learn about the Extended Bandoneon project and the team behind it.',
    url: 'https://extendedbandoneon.com/about',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'About Extended Bandoneon',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'About Extended Bandoneon',
    description: 'Learn about the Extended Bandoneon project and the team behind it.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// JSON-LD structured data for the about page
export const aboutStructuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Extended Bandoneon",
  "description": "Learn about the Extended Bandoneon project, its mission to explore and document contemporary bandoneon techniques, and the team behind it.",
  "url": "https://extendedbandoneon.com/about",
  "mainEntity": {
    "@type": "Organization",
    "name": "Extended Bandoneon",
    "description": "A project dedicated to exploring and documenting contemporary bandoneon techniques and resources.",
    "url": "https://extendedbandoneon.com",
    "member": {
      "@type": "Person",
      "name": "Mercedes Krapovickas"
    }
  }
};
