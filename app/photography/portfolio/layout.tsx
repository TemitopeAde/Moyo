import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Photography Portfolio',
    description: 'Browse selected portrait, editorial, and commissioned photography by Ijabiken Moyo.',
    path: '/photography/portfolio',
});

export default function PhotographyPortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
