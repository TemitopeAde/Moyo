import { createPageMetadata } from '@/lib/seo';
import { query } from '@/lib/db';
import { JsonLd, createCreativeWorkPageSchema, createVisualArtworkSchema } from '@/lib/schema';

export const metadata = createPageMetadata({
    title: 'Selected Works',
    description: 'Browse selected fine art works, materials, dimensions, and archive data by Ijabiken Moyo.',
    path: '/art/works',
});

export const dynamic = 'force-dynamic';

async function getArtworkJsonLd() {
    const { rows } = await query(`
        SELECT id, title, image, category, year, medium, dimensions, description
        FROM artworks
        ORDER BY created_at DESC
    `);

    const artworks = rows.map((artwork) =>
        createVisualArtworkSchema({
            id: artwork.id,
            title: artwork.title,
            image: artwork.image,
            description: artwork.description,
            url: '/art/works',
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            dateCreated: artwork.year,
            artform: 'Fine art',
            category: artwork.category,
        })
    );

    return createCreativeWorkPageSchema({
        id: 'art-works',
        name: 'Selected Works',
        description: 'Selected visual artworks, materials, dimensions, and archive data by Moyo Ayaworan.',
        url: '/art/works',
        about: { '@type': 'Thing', name: 'Visual artwork' },
        hasPart: artworks,
    });
}

export default async function ArtWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = await getArtworkJsonLd();

    return (
        <>
            <JsonLd data={jsonLd} />
            {children}
        </>
    );
}
