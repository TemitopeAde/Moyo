import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(req: NextRequest) {
  const headerKey = req.headers.get('x-admin-key');
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    throw new Error('ADMIN_KEY env not configured');
  }
  if (headerKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
