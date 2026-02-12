import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Photography | Ijabiken Moyo',
    description: 'Portraits, editorial, and commissioned work crafted with precision and intention.',
};

export default function PhotographyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
