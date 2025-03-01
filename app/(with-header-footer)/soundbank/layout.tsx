import { Metadata } from "next";
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Soundbank | Extended Bandoneon',
  description: 'Explore our collection of high-quality bandoneon sound samples. Download free sounds for music production, research, and creative projects.',
  keywords: ['bandoneon sounds', 'bandoneon samples', 'free bandoneon sounds', 'music production', 'sound library'],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Extended Bandoneon Soundbank',
    description: 'High-quality bandoneon sound samples for music production and research',
  },
};

export default function SoundbankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
