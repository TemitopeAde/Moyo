import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Exhibitions',
    description: 'Explore exhibitions, presentations, and archive moments from Ijabiken Moyo.',
    path: '/art/exhibitions',
});

export default function ArtExhibitionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
