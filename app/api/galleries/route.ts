import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import slugify from 'slugify';

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { rows } = await query('SELECT * FROM galleries ORDER BY created_at DESC');
  return NextResponse.json({ galleries: rows });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const slug = body.slug || slugify(body.clientName || 'gallery', { lower: true, strict: true });
  const access_code = body.access_code || randomCode();

  const { rows } = await query(
    `INSERT INTO galleries (
      slug,
      access_code,
      client_name,
      images,
      approved_images,
      finished_images,
      payment_verified,
      payment_url,
      is_locked
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      slug,
      access_code,
      body.clientName,
      body.images || [],
      body.approvedImages || [],
      body.finishedImages || [],
      body.paymentVerified ?? false,
      body.paymentUrl || '',
      body.isLocked ?? false,
    ]
  );
  return NextResponse.json({ gallery: rows[0] });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { id, action, payload } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  if (action === 'addImages') {
    const { rows } = await query(
      `UPDATE galleries
       SET images = ARRAY(
         SELECT image
         FROM (
           SELECT image, MIN(position) AS first_position
           FROM unnest(COALESCE(images, ARRAY[]::text[]) || $1::text[]) WITH ORDINALITY AS combined(image, position)
           GROUP BY image
         ) unique_images
         ORDER BY first_position
       )
       WHERE id=$2
       RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'addFinishedImages') {
    const { rows } = await query(
      `UPDATE galleries
       SET finished_images = ARRAY(
         SELECT image
         FROM (
           SELECT image, MIN(position) AS first_position
           FROM unnest(COALESCE(finished_images, ARRAY[]::text[]) || $1::text[]) WITH ORDINALITY AS combined(image, position)
           GROUP BY image
         ) unique_images
         ORDER BY first_position
       )
       WHERE id=$2
       RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'removeFinishedImage') {
    const { rows } = await query(
      `UPDATE galleries
       SET finished_images = ARRAY(
         SELECT unnest(COALESCE(finished_images, ARRAY[]::text[]))
         EXCEPT
         SELECT unnest($1::text[])
       )
       WHERE id=$2
       RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'approve') {
    const { rows } = await query(
      `UPDATE galleries
       SET approved_images = ARRAY(
         SELECT image
         FROM (
           SELECT image, MIN(position) AS first_position
           FROM unnest(COALESCE(approved_images, ARRAY[]::text[]) || $1::text[]) WITH ORDINALITY AS combined(image, position)
           GROUP BY image
         ) unique_images
         ORDER BY first_position
       )
       WHERE id=$2
       RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'reject') {
    const { rows } = await query(
      `UPDATE galleries
       SET approved_images = ARRAY(
         SELECT unnest(COALESCE(approved_images, ARRAY[]::text[]))
         EXCEPT
         SELECT unnest($1::text[])
       )
       WHERE id=$2
       RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'payment') {
    const { rows } = await query(
      `UPDATE galleries SET payment_verified=$1, payment_url=$2 WHERE id=$3 RETURNING *`,
      [Boolean(payload?.paymentVerified), String(payload?.paymentUrl || ''), id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'lock' || action === 'unlock') {
    const { rows } = await query(
      `UPDATE galleries SET is_locked=$1 WHERE id=$2 RETURNING *`,
      [action === 'lock', id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }

  // generic update
  const { rows } = await query(
    `UPDATE galleries
     SET client_name=$1,
         slug=$2,
         access_code=$3,
         images=$4,
         approved_images=$5,
         finished_images=$6,
         payment_verified=$7,
         payment_url=$8,
         is_locked=$9
     WHERE id=$10
     RETURNING *`,
    [
      payload?.clientName,
      payload?.slug,
      payload?.access_code,
      payload?.images || [],
      payload?.approvedImages || [],
      payload?.finishedImages || [],
      payload?.paymentVerified ?? false,
      payload?.paymentUrl || '',
      payload?.isLocked ?? false,
      id,
    ]
  );
  return NextResponse.json({ gallery: rows[0] });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await query('DELETE FROM galleries WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
