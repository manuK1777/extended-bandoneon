import { metadata, generateArticlesStructuredData } from './metadata';
import Script from 'next/script';

export { metadata };

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
