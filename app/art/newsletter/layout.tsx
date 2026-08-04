import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Art Newsletter',
    description: 'Subscribe for fine art updates, exhibition notes, and studio news from Ijabiken Moyo.',
    path: '/art/newsletter',
});

export default function ArtNewsletterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
