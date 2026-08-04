import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Client Gallery',
    description: 'Private client gallery access for Ijabiken Moyo photography clients.',
    path: '/photography/client-gallery',
    noIndex: true,
});

export default function PhotographyClientGalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
