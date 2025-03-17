import { metadata, aboutStructuredData } from './metadata';
import Script from 'next/script';

export { metadata };

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
      />
      {children}
    </>
  );
}
