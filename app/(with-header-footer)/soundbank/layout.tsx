import { metadata } from './metadata';
import Script from 'next/script';

export { metadata };

export default function SoundbankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
