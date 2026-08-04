import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Photography',
    description: 'Portraits, editorial, and commissioned work crafted with precision and intention.',
    path: '/photography',
});

export default function PhotographyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
