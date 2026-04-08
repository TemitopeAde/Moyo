import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import slugify from 'slugify';

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET() {
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
    `INSERT INTO galleries (slug, access_code, client_name, images, approved_images, is_locked)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [slug, access_code, body.clientName, body.images || [], body.approvedImages || [], body.isLocked ?? false]
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
      `UPDATE galleries SET images = array_cat(images, $1::text[]) WHERE id=$2 RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'approve') {
    const { rows } = await query(
      `UPDATE galleries SET approved_images = approved_images || $1::text[] WHERE id=$2 RETURNING *`,
      [payload?.images || [], id]
    );
    return NextResponse.json({ gallery: rows[0] });
  }
  if (action === 'reject') {
    const { rows } = await query(
      `UPDATE galleries SET approved_images = ARRAY(SELECT unnest(approved_images) EXCEPT SELECT unnest($1::text[])) WHERE id=$2 RETURNING *`,
      [payload?.images || [], id]
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
    `UPDATE galleries SET client_name=$1, slug=$2, access_code=$3, images=$4, approved_images=$5, is_locked=$6 WHERE id=$7 RETURNING *`,
    [
      payload?.clientName,
      payload?.slug,
      payload?.access_code,
      payload?.images || [],
      payload?.approvedImages || [],
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
