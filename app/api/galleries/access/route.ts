import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const accessCode = String(body?.accessCode || '').trim();

  if (!accessCode) {
    return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT id,
            client_name,
            slug,
            images,
            approved_images,
            finished_images,
            payment_verified,
            payment_url,
            is_locked
     FROM galleries
     WHERE access_code = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [accessCode]
  );

  const gallery = rows[0];
  if (!gallery) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
  }

  if (gallery.is_locked) {
    return NextResponse.json({ error: 'This gallery is currently locked' }, { status: 403 });
  }

  return NextResponse.json({
    gallery: {
      id: gallery.id,
      client_name: gallery.client_name,
      slug: gallery.slug,
      images: gallery.images || [],
      approved_images: gallery.approved_images || [],
      finished_images: gallery.payment_verified ? gallery.finished_images || [] : [],
      payment_verified: gallery.payment_verified || false,
      payment_url: gallery.payment_url || '',
      is_locked: gallery.is_locked,
      image_count: (gallery.images || []).length,
      finished_count: (gallery.finished_images || []).length,
    },
  });
}
