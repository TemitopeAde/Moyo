import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Art Shop',
    description: 'View selected editions, archive works, and private viewing options from Ijabiken Moyo.',
    path: '/art/shop',
});

export default function ArtShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
