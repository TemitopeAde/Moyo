import { createPageMetadata } from '@/lib/seo';
import { query } from '@/lib/db';
import { JsonLd, createCreativeWorkPageSchema, createVisualArtworkSchema } from '@/lib/schema';

export const metadata = createPageMetadata({
    title: 'Photography Portfolio',
    description: 'Browse selected portrait, editorial, and commissioned photography by Ijabiken Moyo.',
    path: '/photography/portfolio',
});

export const dynamic = 'force-dynamic';

async function getPhotographyPortfolioJsonLd() {
    const { rows } = await query(`
        SELECT
          i.id,
          i.image_url,
          i.title,
          i.alt_text,
          i.created_at,
          c.name AS category_name,
          c.description AS category_description
        FROM photography_category_images i
        INNER JOIN photography_categories c ON c.id = i.category_id
        WHERE c.is_active = TRUE
        ORDER BY c.display_order ASC, c.created_at DESC, i.display_order ASC, i.created_at DESC
    `);

    const photographs = rows.map((image) =>
        createVisualArtworkSchema({
            id: image.id,
            title: image.title || image.alt_text || image.category_name || 'Photography portfolio image',
            image: image.image_url,
            description: image.alt_text || image.category_description || image.category_name,
            url: '/photography/portfolio',
            dateCreated: image.created_at ? new Date(image.created_at).toISOString() : undefined,
            artform: 'Photography',
            medium: 'Digital photography',
            category: image.category_name,
        })
    );

    return createCreativeWorkPageSchema({
        id: 'photography-portfolio',
        name: 'Photography Portfolio',
        description: 'Selected portrait, editorial, and commissioned photography by Moyo Ayaworan.',
        url: '/photography/portfolio',
        about: { '@type': 'Thing', name: 'Photography' },
        hasPart: photographs,
    });
}

export default async function PhotographyPortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = await getPhotographyPortfolioJsonLd();

    return (
        <>
            <JsonLd data={jsonLd} />
            {children}
        </>
    );
}
