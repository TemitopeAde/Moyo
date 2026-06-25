import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const { rows } = await query(`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.description,
      c.cover_image_url,
      c.display_order,
      c.is_active,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'category_id', i.category_id,
            'image_url', i.image_url,
            'title', i.title,
            'alt_text', i.alt_text,
            'display_order', i.display_order,
            'created_at', i.created_at
          )
          ORDER BY i.display_order ASC, i.created_at DESC
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) AS images
    FROM photography_categories c
    LEFT JOIN photography_category_images i ON i.category_id = c.id
    WHERE c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.created_at DESC
  `);

  return NextResponse.json({ categories: rows });
}
