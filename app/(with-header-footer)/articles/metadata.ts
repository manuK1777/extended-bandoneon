import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Articles | Extended Bandoneon',
  description: 'Read articles about the bandoneon, its history, techniques, and contemporary use in various musical contexts.',
  keywords: ['bandoneon articles', 'bandoneon research', 'bandoneon history', 'contemporary bandoneon', 'bandoneon music', 'bandoneon'],
  alternates: {
    canonical: 'https://extendedbandoneon.com/articles',
  },
  openGraph: {
    ...sharedMetadata.openGraph as object,
    title: 'Bandoneon Articles',
    description: 'Read articles about the bandoneon, its history, techniques, and contemporary use.',
    url: 'https://extendedbandoneon.com/articles',
    images: [
      {
        url: 'https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg',
        alt: 'Bandoneon Articles',
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    ...sharedMetadata.twitter as object,
    title: 'Bandoneon Articles',
    description: 'Read articles about the bandoneon, its history, techniques, and contemporary use.',
    images: ['https://res.cloudinary.com/djxcomnwb/image/upload/v1738595952/main_k58gfs.jpg'],
  },
};

// Generate structured data for articles collection
export function generateArticlesStructuredData(articles: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Bandoneon Articles",
    "description": "A collection of articles about the bandoneon",
    "numberOfItems": articles.length,
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": article.title,
        "description": article.description || article.excerpt,
        "url": `https://extendedbandoneon.com/articles/${article.slug}`,
        "datePublished": article.publishedAt || article.createdAt,
        "author": {
          "@type": "Person",
          "name": article.author || "Extended Bandoneon"
        }
      }
    }))
  };
}
