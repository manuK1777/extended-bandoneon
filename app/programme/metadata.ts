import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Concert Programme | Extended Bandoneon',
  description: 'View programme details for Extended Bandoneon.',
  keywords: ['bandoneon concert', 'bandoneon performance', 'concert programme', 'contemporary bandoneon', 'bandoneon event'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/programme',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Extended Bandoneon Concert Programme',
    description: 'View programme details for Extended Bandoneon concerts featuring contemporary bandoneon music and techniques.',
    url: 'https://extendedbandoneon.com/programme',
    type: 'website' 
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Extended Bandoneon Concert Programme',
    description: 'View programme details for Extended Bandoneon concerts featuring contemporary bandoneon music and techniques.',
  },
};

// This function generates structured data for concert events
// It takes the concert details as input
export function generateConcertStructuredData(concertDetails: {
  name: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  performer: string;
  description: string;
  image?: string;
  offers?: {
    url: string;
    price?: string;
    priceCurrency?: string;
    availability?: 'InStock' | 'SoldOut' | 'PreOrder';
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "name": concertDetails.name,
    "startDate": concertDetails.startDate,
    "endDate": concertDetails.endDate || concertDetails.startDate,
    "location": {
      "@type": "Place",
      "name": concertDetails.location.name,
      "address": concertDetails.location.address
    },
    "performer": {
      "@type": "Person",
      "name": concertDetails.performer
    },
    "description": concertDetails.description,
    ...(concertDetails.offers && {
      "offers": {
        "@type": "Offer",
        "url": concertDetails.offers.url,
        "price": concertDetails.offers.price,
        "priceCurrency": concertDetails.offers.priceCurrency,
        "availability": `https://schema.org/${concertDetails.offers.availability || 'InStock'}`
      }
    })
  };
}
