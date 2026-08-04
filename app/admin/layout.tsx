import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
    title: 'Admin',
    description: 'Private administration area for Ijabiken Moyo.',
    path: '/admin',
    noIndex: true,
});

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
