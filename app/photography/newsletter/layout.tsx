import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Photography Newsletter',
    description: 'Subscribe for photography updates, new projects, studio openings, and booking availability.',
    path: '/photography/newsletter',
});

export default function PhotographyNewsletterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
