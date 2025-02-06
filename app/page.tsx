import type { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'Welcome to Extended Bandoneon',
  description: 'Discover the art of bandoneon through extended techniques, tutorials, and musical exploration',
  openGraph: {
    title: 'The Extended Bandoneon',
    description: 'Explore the innovative world of extended bandoneon techniques, sound banks, and more, redefining the expressive range of the instrument.',
    type: 'website',
  },
};

export default function Home() {
  return <HomeContent />;
}