import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { rows } = await query('SELECT * FROM artworks ORDER BY created_at DESC');
  return NextResponse.json({ artworks: rows });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { title, price, image, category, isFeatured, isAvailable } = body;
  const { rows } = await query(
    `INSERT INTO artworks (title, price, image, category, is_featured, is_available)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [title, price, image, category, isFeatured ?? false, isAvailable ?? true]
  );
  return NextResponse.json({ artwork: rows[0] });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ['title', 'price', 'image', 'category', 'isFeatured', 'isAvailable'] as const) {
    if (key in updates) {
      const col = key === 'isFeatured' ? 'is_featured' : key === 'isAvailable' ? 'is_available' : key;
      fields.push(`${col} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }
  if (!fields.length) return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  values.push(id);

  const { rows } = await query(
    `UPDATE artworks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return NextResponse.json({ artwork: rows[0] });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await query('DELETE FROM artworks WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
