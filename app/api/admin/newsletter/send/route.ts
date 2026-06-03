import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

const validLists = new Set(['all', 'photography', 'art']);

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBody(body: string) {
  return escapeHtml(body)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return NextResponse.json({ error: 'EMAIL_USER and EMAIL_PASS are not configured.' }, { status: 500 });
  }

  const body = await req.json();
  const listType = normalize(body.listType) || 'all';
  const subject = normalize(body.subject);
  const message = normalize(body.message);
  const previewText = normalize(body.previewText);

  if (!validLists.has(listType)) {
    return NextResponse.json({ error: 'Choose a valid newsletter list.' }, { status: 400 });
  }

  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
  }

  const subscribers = await query(
    `SELECT email, list_type
     FROM newsletter_subscribers
     WHERE status = 'active'
       AND ($1 = 'all' OR list_type = $1)
     ORDER BY subscribed_at DESC`,
    [listType]
  );

  if (subscribers.rows.length === 0) {
    return NextResponse.json({ error: 'No active subscribers for this list.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const htmlBody = formatBody(message);
  const html = `
    <div style="margin:0;background:#050505;color:#f7f7f7;font-family:Inter,Arial,sans-serif;padding:32px;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(212,175,55,.35);padding:32px;">
        <p style="margin:0 0 24px;color:#d4af37;font-size:11px;letter-spacing:.28em;text-transform:uppercase;">Ijabiken Moyo</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-style:italic;margin:0 0 18px;font-size:32px;color:#fff;">${escapeHtml(subject)}</h1>
        ${previewText ? `<p style="color:#aaa;margin:0 0 28px;line-height:1.7;">${escapeHtml(previewText)}</p>` : ''}
        <div style="color:#e8e8e8;line-height:1.75;font-size:15px;">${htmlBody}</div>
        <p style="margin:32px 0 0;color:#777;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">You are receiving this because you subscribed to Moyo updates.</p>
      </div>
    </div>
  `;

  for (const subscriber of subscribers.rows) {
    await transporter.sendMail({
      from: emailUser,
      to: subscriber.email,
      subject,
      text: message,
      html,
    });
  }

  await query(
    `UPDATE newsletter_subscribers
     SET last_emailed_at = NOW()
     WHERE status = 'active'
       AND ($1 = 'all' OR list_type = $1)`,
    [listType]
  );

  return NextResponse.json({
    message: 'Newsletter sent.',
    sent: subscribers.rows.length,
  });
}
