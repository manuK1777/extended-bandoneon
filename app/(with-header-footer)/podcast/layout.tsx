import { metadata, podcastStructuredData } from './metadata';
import Script from 'next/script';

export { metadata };

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="podcast-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastStructuredData) }}
      />
      {children}
    </>
  );
}
