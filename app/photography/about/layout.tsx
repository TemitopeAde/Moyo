import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Photography About',
    description: 'Learn about Ijabiken Moyo as a photographer and the visual philosophy behind the work.',
    path: '/photography/about',
});

export default function PhotographyAboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
