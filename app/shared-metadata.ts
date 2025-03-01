import type { Metadata } from "next";

const MAIN_OG_IMAGE = {
  url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
  width: 1200,
  height: 630,
  alt: 'Bandoneon extended techniques'
} as const;

export const sharedMetadata: Metadata = {
  metadataBase: new URL('https://www.extendedbandoneon.com'),
  title: {
    template: '%s | Extended Bandoneon',
    default: 'Extended Bandoneon'
  },
  description: 'Explore extended techniques of the bandoneon',
  keywords: ['bandoneon', 'music', 'techniques', 'learning', 'extended techniques', 'contemporary music'],

  // Favicon configuration
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon-192x192.png' }
    ],
  },

  // Open Graph metadata
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.extendedbandoneon.com',
    siteName: 'Extended Bandoneon',
    title: 'Extended Bandoneon',
    description: 'Explore extended techniques of the bandoneon',
    images: [
      MAIN_OG_IMAGE
    ],
  },

  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Extended Bandoneon',
    description: 'Explore extended techniques of the bandoneon',
    images: [
      MAIN_OG_IMAGE
    ],
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
  },
  
  // Verification for search engines (you can add these later)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};
