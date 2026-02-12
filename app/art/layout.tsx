import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fine Art | Ijabiken Moyo',
    description: 'Original works, exhibitions, and commissions exploring identity, memory, and presence.',
};

export default function ArtLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
