import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Fine Art About',
    description: 'Learn about Ijabiken Moyo as a fine artist and the practice behind the work.',
    path: '/art/about',
});

export default function ArtAboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
