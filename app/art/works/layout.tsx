import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Selected Works',
    description: 'Browse selected fine art works, materials, dimensions, and archive data by Ijabiken Moyo.',
    path: '/art/works',
});

export default function ArtWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
