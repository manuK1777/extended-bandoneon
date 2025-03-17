import { metadata, generateTechniquesStructuredData } from './metadata';
import Script from 'next/script';

export { metadata };

export default function TechniquesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
