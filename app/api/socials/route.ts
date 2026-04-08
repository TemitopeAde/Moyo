import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { rows } = await query('SELECT * FROM social_links ORDER BY created_at DESC');
  return NextResponse.json({ socials: rows });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { rows } = await query(
    `INSERT INTO social_links (platform, url, icon) VALUES ($1,$2,$3) RETURNING *`,
    [body.platform, body.url, body.icon || '']
  );
  return NextResponse.json({ social: rows[0] });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { rows } = await query(
    `UPDATE social_links SET platform=$1, url=$2, icon=$3 WHERE id=$4 RETURNING *`,
    [updates.platform, updates.url, updates.icon || '', id]
  );
  return NextResponse.json({ social: rows[0] });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await query('DELETE FROM social_links WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
