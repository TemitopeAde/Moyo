import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
  return NextResponse.json({ orders: rows });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
  const { rows } = await query(`UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`, [status, id]);
  return NextResponse.json({ order: rows[0] });
}
