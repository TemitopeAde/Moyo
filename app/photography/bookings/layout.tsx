import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Photography Bookings',
    description: 'Book portrait, editorial, commercial, and commissioned photography with Ijabiken Moyo.',
    path: '/photography/bookings',
});

export default function PhotographyBookingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
