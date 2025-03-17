import { metadata, generateConcertStructuredData } from './metadata';
import Script from 'next/script';

export { metadata };

// Current concert details - update this for each concert
// These details will be used for structured data but won't affect the generic metadata
const currentConcert = {
  name: "Extended Bandoneon Concert",
  startDate: "2025-03-18T19:00:00+02:00", // First set start
  endDate: "2025-03-18T20:45:00+02:00",   // Second set end
  location: {
    name: "Musiikkitalo Black Box",
    address: "Mannerheimintie 13, 00100 Helsinki, Finland"
  },
  performer: "Mercedes Krapovickas",
  description: "A concert featuring extended techniques for the bandoneon. Two sets: 19:00-19:45 (Set 1) and 20:00-20:45 (Set 2)."
};

// Generate structured data for the current concert
const concertStructuredData = generateConcertStructuredData(currentConcert);

export default function ProgrammesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Script
        id="concert-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(concertStructuredData) }}
      />
      {children}
    </div>
  );
}
