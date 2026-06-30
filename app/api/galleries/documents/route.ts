import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

type GalleryDocument = {
  id: number;
  gallery_id: number;
  document_type: string;
  title: string;
  client_email: string;
  amount: string | number;
  currency: string;
  due_date: string;
  line_items: string;
  terms: string;
  sent_at: string | null;
  created_at: string;
  client_name?: string;
  access_code?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeType(value: unknown) {
  return normalize(value).toLowerCase() === 'contract' ? 'contract' : 'invoice';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(amount: string | number, currency: string) {
  const numeric = Number(amount || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return `${currency || 'NGN'} ${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function documentText(doc: GalleryDocument) {
  const label = doc.document_type === 'contract' ? 'Contract' : 'Invoice';
  const amount = formatMoney(doc.amount, doc.currency);
  return [
    'Ijabiken Moyo',
    label,
    '',
    doc.title,
    `Client: ${doc.client_name || 'Client'}`,
    `Email: ${doc.client_email}`,
    amount ? `Amount: ${amount}` : '',
    doc.due_date ? `Due date: ${doc.due_date}` : '',
    '',
    doc.line_items || (doc.document_type === 'contract' ? 'Agreement details to be confirmed by both parties.' : 'Photography services.'),
    '',
    doc.terms || 'Thank you.',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

function wrapText(text: string, max = 82) {
  return text.split('\n').flatMap((line) => {
    if (!line) return [''];
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (`${current} ${word}`.trim().length > max) {
        lines.push(current);
        current = word;
      } else {
        current = `${current} ${word}`.trim();
      }
    }
    if (current) lines.push(current);
    return lines;
  });
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(doc: GalleryDocument) {
  const lines = wrapText(documentText(doc)).slice(0, 48);
  const content = [
    'BT',
    '/F1 11 Tf',
    '50 780 Td',
    '16 TL',
    ...lines.map((line, index) => `${index === 0 ? '' : 'T*'}(${pdfEscape(line)}) Tj`),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

function emailHtml(doc: GalleryDocument) {
  const amount = formatMoney(doc.amount, doc.currency);
  const label = doc.document_type === 'contract' ? 'Contract' : 'Invoice';
  return `
    <div style="margin:0;background:#050505;color:#fafafa;font-family:Arial,sans-serif;padding:32px;">
      <main style="max-width:640px;margin:0 auto;border:1px solid rgba(146,1,16,.35);padding:32px;">
        <p style="margin:0 0 22px;color:#920110;font-size:11px;letter-spacing:.3em;text-transform:uppercase;">Ijabiken Moyo</p>
        <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;margin:0 0 12px;font-size:30px;color:#fff;">${escapeHtml(label)}</h1>
        <h2 style="margin:0 0 24px;font-size:18px;color:#f4f4f4;">${escapeHtml(doc.title)}</h2>
        ${amount ? `<p style="margin:0 0 10px;color:#fff;"><strong>Amount:</strong> ${escapeHtml(amount)}</p>` : ''}
        ${doc.due_date ? `<p style="margin:0 0 22px;color:#bbb;"><strong>Due date:</strong> ${escapeHtml(doc.due_date)}</p>` : ''}
        <div style="white-space:pre-wrap;line-height:1.7;color:#ddd;">${escapeHtml(doc.line_items || '')}</div>
        ${doc.terms ? `<hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:28px 0;" /><div style="white-space:pre-wrap;line-height:1.7;color:#bbb;">${escapeHtml(doc.terms)}</div>` : ''}
        <p style="margin:32px 0 0;color:#777;font-size:12px;line-height:1.6;">A PDF copy is attached.</p>
      </main>
    </div>
  `;
}

async function getDocument(id: string) {
  const { rows } = await query(
    `SELECT d.*, g.client_name, g.access_code
     FROM gallery_documents d
     JOIN galleries g ON g.id = d.gallery_id
     WHERE d.id = $1`,
    [id]
  );
  return rows[0] as GalleryDocument | undefined;
}

function getTransportConfig() {
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

function parseGeminiDraft(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return {
      title: normalize(parsed.title),
      lineItems: normalize(parsed.lineItems),
      terms: normalize(parsed.terms),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const id = req.nextUrl.searchParams.get('id');
  const format = req.nextUrl.searchParams.get('format');
  if (id && format === 'pdf') {
    const doc = await getDocument(id);
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    const pdf = buildPdf(doc);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${doc.document_type}-${doc.id}.pdf"`,
      },
    });
  }

  const galleryId = req.nextUrl.searchParams.get('galleryId');
  const params = galleryId ? [galleryId] : [];
  const where = galleryId ? 'WHERE d.gallery_id = $1' : '';
  const { rows } = await query(
    `SELECT d.*, g.client_name
     FROM gallery_documents d
     JOIN galleries g ON g.id = d.gallery_id
     ${where}
     ORDER BY d.created_at DESC`,
    params
  );
  return NextResponse.json({ documents: rows });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const action = normalize(body.action);
  const galleryId = Number(body.galleryId);
  const documentType = normalizeType(body.documentType);
  const title = normalize(body.title) || (documentType === 'contract' ? 'Photography Contract' : 'Photography Invoice');
  const clientEmail = normalize(body.clientEmail).toLowerCase();
  const amount = Number(body.amount || 0);
  const currency = normalize(body.currency) || 'NGN';
  const dueDate = normalize(body.dueDate);
  const lineItems = normalize(body.lineItems);
  const terms = normalize(body.terms);

  if (!galleryId) return NextResponse.json({ error: 'Choose a gallery.' }, { status: 400 });

  if (action === 'generate') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });

    const { rows } = await query('SELECT client_name FROM galleries WHERE id = $1', [galleryId]);
    const gallery = rows[0];
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

    const brief = [lineItems, terms].filter(Boolean).join('\n\n') || 'A clean photography service document.';
    const prompt = [
      `Create a concise ${documentType} draft for Ijabiken Moyo.`,
      `Client name: ${gallery.client_name}`,
      amount > 0 ? `Amount: ${currency} ${amount}` : '',
      dueDate ? `Due date: ${dueDate}` : '',
      'Use a professional, simple photography-studio tone.',
      'Return only valid JSON with keys: title, lineItems, terms.',
      'lineItems should be plain text with short lines. terms should be plain text.',
      '',
      'Brief:',
      brief,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 520 },
      }),
    });
    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) return NextResponse.json({ error: 'Gemini could not generate this document.' }, { status: 502 });

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
    const draft = parseGeminiDraft(text);
    if (!draft) return NextResponse.json({ error: 'Gemini returned an unusable draft.' }, { status: 502 });
    return NextResponse.json({ draft });
  }

  if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    return NextResponse.json({ error: 'Enter a valid client email.' }, { status: 400 });
  }

  const { rows } = await query(
    `INSERT INTO gallery_documents (
      gallery_id, document_type, title, client_email, amount, currency, due_date, line_items, terms
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [galleryId, documentType, title, clientEmail, Number.isFinite(amount) ? amount : 0, currency, dueDate, lineItems, terms]
  );

  return NextResponse.json({ document: rows[0] });
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const id = normalize(body.id);
  const action = normalize(body.action);
  if (!id) return NextResponse.json({ error: 'Missing document id.' }, { status: 400 });

  if (action === 'send') {
    const doc = await getDocument(id);
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });

    const config = getTransportConfig();
    if (!config) return NextResponse.json({ error: 'Email is not configured.' }, { status: 500 });

    const transporter = nodemailer.createTransport(
      config.host
        ? { host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass } }
        : { service: 'gmail', auth: { user: config.user, pass: config.pass } }
    );

    const label = doc.document_type === 'contract' ? 'Contract' : 'Invoice';
    await transporter.sendMail({
      from: config.from,
      to: doc.client_email,
      subject: `${label}: ${doc.title}`,
      text: documentText(doc),
      html: emailHtml(doc),
      attachments: [
        {
          filename: `${doc.document_type}-${doc.id}.pdf`,
          content: buildPdf(doc),
          contentType: 'application/pdf',
        },
      ],
    });

    const { rows } = await query(
      `UPDATE gallery_documents
       SET sent_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return NextResponse.json({ document: rows[0], message: 'Document sent.' });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing document id.' }, { status: 400 });
  await query('DELETE FROM gallery_documents WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
