import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const { rows } = await query(
    `SELECT client_name,
            slug,
            review_rating,
            review_text,
            review_submitted_at
     FROM galleries
     WHERE review_featured = TRUE
       AND review_submitted_at IS NOT NULL
       AND COALESCE(review_text, '') <> ''
     ORDER BY review_submitted_at DESC
     LIMIT 8`
  );

  return NextResponse.json({
    reviews: rows.map((review) => ({
      name: review.client_name,
      session: 'Delivered Gallery',
      quote: review.review_text,
      rating: review.review_rating || 5,
      slug: review.slug,
    })),
  });
}
