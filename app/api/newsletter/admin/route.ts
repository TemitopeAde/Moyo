import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

type ListType = 'all' | 'photography' | 'art';

const validLists = new Set<ListType>(['all', 'photography', 'art']);

function normalizeList(value: unknown): ListType {
  return typeof value === 'string' && validLists.has(value as ListType) ? (value as ListType) : 'all';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeEditorHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+(href|src)\s*=\s*"javascript:[^"]*"/gi, '')
    .replace(/\s+(href|src)\s*=\s*'javascript:[^']*'/gi, '');
}

function htmlToText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function textToEmailHtml(body: string, previewText?: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const text = escapeHtml(paragraph).replace(/\n/g, '<br />');
      return '<p style="margin:0 0 18px;line-height:1.7;">' + text + '</p>';
    })
    .join('');

  return wrapEmailHtml(paragraphs, previewText);
}

function wrapEmailHtml(contentHtml: string, previewText?: string) {
  return [
    '<!doctype html>',
    '<html>',
    '<body style="margin:0;background:#050505;color:#fafafa;font-family:Arial,sans-serif;">',
    '<div style="display:none;max-height:0;overflow:hidden;color:transparent;">' + escapeHtml(previewText || '') + '</div>',
    '<main style="max-width:640px;margin:0 auto;padding:44px 24px;">',
    '<p style="margin:0 0 24px;color:#920110;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;">Ijabiken Moyo</p>',
    '<div style="font-size:16px;color:#f5f5f5;line-height:1.7;">' + contentHtml + '</div>',
    '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.12);margin:34px 0;" />',
    '<p style="margin:0;color:rgba(255,255,255,0.42);font-size:12px;line-height:1.6;">You are receiving this because you subscribed to Ijabiken Moyo updates.</p>',
    '</main>',
    '</body>',
    '</html>',
  ].join('');
}

function getEmailConfig() {
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASS || process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || process.env.EMAIL_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || process.env.EMAIL_PORT || process.env.MAIL_PORT || 587);
  const secureValue = process.env.SMTP_SECURE || process.env.EMAIL_SECURE || process.env.MAIL_SECURE;
  const secure = secureValue ? secureValue.toLowerCase() === 'true' : port === 465;
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_FROM || user;

  if (!user || !pass || !from) return null;

  return { user, pass, host, port, secure, from };
}

async function getRecipients(listType: ListType) {
  const params = listType === 'all' ? [] : [listType];
  const where = listType === 'all' ? "status = 'active'" : "status = 'active' AND list_type = $1";
  const { rows } = await query(
    `SELECT id, email, list_type, subscribed_at, last_emailed_at
     FROM newsletter_subscribers
     WHERE ${where}
     ORDER BY subscribed_at DESC`,
    params
  );
  return rows;
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const listType = normalizeList(req.nextUrl.searchParams.get('listType'));
  const [subscribers, counts] = await Promise.all([
    getRecipients(listType),
    query(
      `SELECT list_type, COUNT(*)::int AS count
       FROM newsletter_subscribers
       WHERE status = 'active'
       GROUP BY list_type`
    ),
  ]);

  return NextResponse.json({ subscribers, counts: counts.rows });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const listType = normalizeList(body.listType);
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const previewText = typeof body.previewText === 'string' ? body.previewText.trim() : '';
  const bodyText = typeof body.body === 'string' ? body.body.trim() : '';
  const bodyHtml = typeof body.bodyHtml === 'string' ? sanitizeEditorHtml(body.bodyHtml.trim()) : '';
  const fallbackText = htmlToText(bodyHtml);
  const emailConfig = getEmailConfig();

  if (!subject) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
  if (!bodyText && !fallbackText) {
    return NextResponse.json({ error: 'Newsletter body is required.' }, { status: 400 });
  }
  if (!emailConfig) {
    return NextResponse.json({ error: 'SMTP credentials are not configured.' }, { status: 500 });
  }

  const recipients = await getRecipients(listType);
  const emails = recipients.map((subscriber) => subscriber.email).filter(Boolean);

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No active subscribers found for this list.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport(
    emailConfig.host
      ? {
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.pass,
          },
        }
      : {
          service: 'gmail',
          auth: {
            user: emailConfig.user,
            pass: emailConfig.pass,
          },
        }
  );

  await transporter.sendMail({
    from: emailConfig.from,
    to: emailConfig.from,
    bcc: emails,
    subject,
    text: bodyText || fallbackText,
    html: bodyHtml ? wrapEmailHtml(bodyHtml, previewText) : textToEmailHtml(bodyText, previewText),
  });

  await query(
    `UPDATE newsletter_subscribers
     SET last_emailed_at = NOW()
     WHERE status = 'active' ${listType === 'all' ? '' : 'AND list_type = $1'}`,
    listType === 'all' ? [] : [listType]
  );

  return NextResponse.json({ message: 'Newsletter sent.', sentCount: emails.length });
}
