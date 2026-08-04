import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Art Commissions',
    description: 'Commission original fine art by Ijabiken Moyo for private and collected spaces.',
    path: '/art/commissions',
});

export default function ArtCommissionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
