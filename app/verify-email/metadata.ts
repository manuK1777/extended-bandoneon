import { Metadata } from 'next';
import { sharedMetadata } from '@/app/shared-metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Email Verification | Extended Bandoneon',
  description: 'Verify your email address for Extended Bandoneon',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Email Verification | Extended Bandoneon',
    description: 'Verify your email address for Extended Bandoneon',
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Email Verification | Extended Bandoneon',
    description: 'Verify your email address for Extended Bandoneon',
  }
};
