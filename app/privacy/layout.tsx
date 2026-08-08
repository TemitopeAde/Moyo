import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Privacy',
  description: 'Privacy information for Ijabiken Moyo website visitors and clients.',
  path: '/privacy',
  noIndex: true,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
