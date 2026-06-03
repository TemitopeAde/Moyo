import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const validLists = new Set(['photography', 'art']);

function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const listType = typeof body.listType === 'string' ? body.listType : body.profileType;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (!validLists.has(listType)) {
      return NextResponse.json({ error: 'Invalid newsletter list.' }, { status: 400 });
    }

    const unsubscribeToken = randomBytes(32).toString('hex');
    await query(
      `INSERT INTO newsletter_subscribers (email, list_type, status, unsubscribe_token, subscribed_at, unsubscribed_at)
       VALUES ($1, $2, 'active', $3, NOW(), NULL)
       ON CONFLICT (email, list_type)
       DO UPDATE SET status = 'active', unsubscribed_at = NULL, subscribed_at = NOW()
       RETURNING id`,
      [email, listType, unsubscribeToken]
    );

    return NextResponse.json({ message: 'You are subscribed.' });
  } catch (error) {
    console.error('[newsletter.subscribe] error', error);
    return NextResponse.json({ error: 'Unable to subscribe right now.' }, { status: 500 });
  }
}
