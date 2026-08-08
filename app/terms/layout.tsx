import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Terms',
  description: 'Terms information for Ijabiken Moyo website visitors and clients.',
  path: '/terms',
  noIndex: true,
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
