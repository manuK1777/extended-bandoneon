import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Extended Bandoneon Soundbank - Free Bandoneon Sound Samples',
  description: 'Explore our collection of high-quality bandoneon sound samples. Download free sounds for music production, research, and creative projects.',
  keywords: ['bandoneon sounds', 'bandoneon samples', 'free bandoneon sounds', 'music production', 'sound library'],
  openGraph: {
    title: 'Extended Bandoneon Soundbank',
    description: 'High-quality bandoneon sound samples for music production and research',
    type: 'website',
  },
};

export default function SoundbankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
