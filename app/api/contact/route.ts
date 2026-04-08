import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

async function getContact() {
  const { rows } = await query('SELECT * FROM contact WHERE id=1');
  return rows[0];
}

export async function GET() {
  const contact = await getContact();
  return NextResponse.json({ contact });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { rows } = await query(
    `UPDATE contact SET phone=$1, email=$2, address=$3 WHERE id=1 RETURNING *`,
    [body.phone ?? '', body.email ?? '', body.address ?? '']
  );
  return NextResponse.json({ contact: rows[0] });
}
