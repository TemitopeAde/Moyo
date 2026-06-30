import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { inflateSync } from 'zlib';
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
const BRAND_RED_RGB = '0.572 0.004 0.063';
const LOGO_PATH = path.join(process.cwd(), 'public', 'brand', 'moyo-logo-red.png');
const PDF_LOGO_BACKGROUND = { r: 255, g: 255, b: 255 };
let cachedPdfLogo: { width: number; height: number; hex: string } | null | undefined;

function normalize(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeId(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return normalize(value);
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

function pdfSafe(value: string) {
  return value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function getDocumentLines(doc: GalleryDocument) {
  const fallback =
    doc.document_type === 'contract'
      ? 'Photography service agreement and creative usage terms.'
      : 'Photography services';

  return (doc.line_items || fallback)
    .replace(/\\n/g, '\n')
    .replace(/\s+[-•]\s+/g, '\n')
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getLogoAttachment() {
  if (!existsSync(LOGO_PATH)) return null;
  return {
    filename: 'moyo-logo-red.png',
    path: LOGO_PATH,
    cid: 'moyo-logo',
  };
}

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}

function getPdfLogo() {
  if (cachedPdfLogo !== undefined) return cachedPdfLogo;
  cachedPdfLogo = null;
  if (!existsSync(LOGO_PATH)) return cachedPdfLogo;

  try {
    const source = readFileSync(LOGO_PATH);
    let offset = 8;
    let width = 0;
    let height = 0;
    const chunks: Buffer[] = [];
    while (offset < source.length) {
      const length = source.readUInt32BE(offset);
      const type = source.toString('ascii', offset + 4, offset + 8);
      const data = source.subarray(offset + 8, offset + 8 + length);
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
      }
      if (type === 'IDAT') chunks.push(data);
      if (type === 'IEND') break;
      offset += length + 12;
    }
    if (!width || !height || chunks.length === 0) return cachedPdfLogo;

    const inflated = inflateSync(Buffer.concat(chunks));
    const stride = width * 4;
    const rows: Buffer[] = [];
    let index = 0;
    let previous = Buffer.alloc(stride);
    for (let y = 0; y < height; y += 1) {
      const filter = inflated[index];
      index += 1;
      const row = Buffer.alloc(stride);
      for (let x = 0; x < stride; x += 1) {
        const left = x >= 4 ? row[x - 4] : 0;
        const up = previous[x];
        const upperLeft = x >= 4 ? previous[x - 4] : 0;
        let value = inflated[index];
        index += 1;
        if (filter === 1) value = (value + left) & 255;
        if (filter === 2) value = (value + up) & 255;
        if (filter === 3) value = (value + Math.floor((left + up) / 2)) & 255;
        if (filter === 4) value = (value + paethPredictor(left, up, upperLeft)) & 255;
        row[x] = value;
      }
      rows.push(row);
      previous = row;
    }

    const outputWidth = 140;
    const outputHeight = Math.max(1, Math.round((height / width) * outputWidth));
    const rgb = Buffer.alloc(outputWidth * outputHeight * 3);
    for (let y = 0; y < outputHeight; y += 1) {
      const sourceY = Math.min(height - 1, Math.floor((y / outputHeight) * height));
      const row = rows[sourceY];
      for (let x = 0; x < outputWidth; x += 1) {
        const sourceX = Math.min(width - 1, Math.floor((x / outputWidth) * width));
        const sourceIndex = sourceX * 4;
        const alpha = row[sourceIndex + 3] / 255;
        const targetIndex = (y * outputWidth + x) * 3;
        rgb[targetIndex] = Math.round(row[sourceIndex] * alpha + PDF_LOGO_BACKGROUND.r * (1 - alpha));
        rgb[targetIndex + 1] = Math.round(row[sourceIndex + 1] * alpha + PDF_LOGO_BACKGROUND.g * (1 - alpha));
        rgb[targetIndex + 2] = Math.round(row[sourceIndex + 2] * alpha + PDF_LOGO_BACKGROUND.b * (1 - alpha));
      }
    }
    cachedPdfLogo = { width: outputWidth, height: outputHeight, hex: rgb.toString('hex').toUpperCase() };
  } catch {
    cachedPdfLogo = null;
  }
  return cachedPdfLogo;
}

function buildPdf(doc: GalleryDocument) {
  const label = doc.document_type === 'contract' ? 'CONTRACT' : 'INVOICE';
  const amount = formatMoney(doc.amount, doc.currency);
  const createdAt = doc.created_at ? new Date(doc.created_at) : new Date();
  const createdDate = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = getDocumentLines(doc);
  const terms = wrapText(doc.terms || 'Thank you for trusting Ijabiken Moyo.', 62).slice(0, 7);
  const logo = getPdfLogo();
  const commands: string[] = [];
  const text = (value: string, x: number, y: number, size = 10, font = 'F1', color = '0.08 0.08 0.08') => {
    commands.push(
      'BT',
      `${color} rg`,
      `/${font} ${size} Tf`,
      `${x} ${y} Td`,
      `(${pdfEscape(pdfSafe(value))}) Tj`,
      'ET'
    );
  };
  const rect = (x: number, y: number, width: number, height: number, color: string) => {
    commands.push(`${color} rg`, `${x} ${y} ${width} ${height} re`, 'f');
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color = '0.82 0.82 0.82', width = 0.8) => {
    commands.push(`${color} RG`, `${width} w`, `${x1} ${y1} m`, `${x2} ${y2} l`, 'S');
  };

  rect(0, 0, 612, 792, '0.965 0.957 0.93');
  rect(54, 48, 504, 696, '1 1 1');
  line(54, 744, 558, 744, '0.86 0.84 0.78', 0.8);
  line(54, 48, 558, 48, '0.86 0.84 0.78', 0.8);

  if (logo) {
    commands.push('q', `82 0 0 ${Math.round((logo.height / logo.width) * 82)} 86 694 cm`, '/Logo Do', 'Q');
  } else {
    rect(86, 690, 30, 24, BRAND_RED_RGB);
    rect(94, 695, 4, 10, '1 1 1');
    rect(102, 698, 4, 7, '1 1 1');
    rect(110, 701, 4, 4, '1 1 1');
    text('moyo', 86, 668, 14, 'F2', BRAND_RED_RGB);
  }
  text(label, 386, 698, 20, 'F2', '0.05 0.05 0.05');

  text(doc.client_name || 'Client Name', 86, 642, 11, 'F2');
  text(`Date issued: ${createdDate}`, 86, 621, 8, 'F1', '0.25 0.25 0.25');
  text(`${label === 'INVOICE' ? 'Invoice' : 'Contract'} No: ${doc.id}`, 86, 607, 8, 'F1', '0.25 0.25 0.25');
  text(`Client email: ${doc.client_email}`, 86, 593, 8, 'F1', '0.25 0.25 0.25');

  text('Ijabiken Moyo', 386, 642, 8, 'F2', '0.12 0.12 0.12');
  text('Photography & Fine Art', 386, 629, 8, 'F1', '0.32 0.32 0.32');
  text('Lagos / London / Amsterdam', 386, 616, 8, 'F1', '0.32 0.32 0.32');
  text('ijabikenm@gmail.com', 386, 603, 8, 'F1', '0.32 0.32 0.32');

  line(86, 555, 526, 555, '0.82 0.82 0.82');
  text('DESCRIPTION', 86, 568, 7, 'F2', '0.35 0.35 0.35');
  text(label === 'INVOICE' ? 'DETAILS' : 'SCOPE', 338, 568, 7, 'F2', '0.35 0.35 0.35');
  text('SUBTOTAL', 462, 568, 7, 'F2', '0.35 0.35 0.35');

  let y = 532;
  lines.forEach((item, index) => {
    const itemLines = wrapText(item, 36).slice(0, 2);
    text(itemLines[0] || item, 86, y, 9, index === 0 ? 'F2' : 'F1');
    if (itemLines[1]) text(itemLines[1], 86, y - 13, 8, 'F1', '0.35 0.35 0.35');
    text(index === 0 ? (label === 'INVOICE' ? 'Service' : 'Agreement') : 'Item', 338, y, 8, 'F1', '0.35 0.35 0.35');
    text(index === 0 && amount ? amount : '-', 462, y, 9, index === 0 ? 'F2' : 'F1', index === 0 && amount ? BRAND_RED_RGB : '0.35 0.35 0.35');
    y -= itemLines[1] ? 34 : 26;
  });

  rect(54, 64, 504, 185, '0.925 0.922 0.88');
  rect(54, 64, 4, 185, BRAND_RED_RGB);
  line(86, 132, 526, 132, '0.74 0.74 0.70');
  line(86, 82, 526, 82, '0.74 0.74 0.70');
  text('PAYMENT INFO', 86, 146, 7, 'F2', '0.38 0.38 0.35');
  text('DUE BY', 274, 146, 7, 'F2', '0.38 0.38 0.35');
  text('TOTAL DUE', 438, 146, 7, 'F2', '0.38 0.38 0.35');
  text('Bank transfer / studio confirmation', 86, 113, 8, 'F1', '0.20 0.20 0.19');
  text('Invoice reference: Moyo-' + doc.id, 86, 101, 8, 'F1', '0.20 0.20 0.19');
  text(doc.due_date || 'On receipt', 274, 108, 14, 'F1', '0.05 0.05 0.05');
  text(amount || 'To be confirmed', 438, 108, 16, 'F2', BRAND_RED_RGB);

  rect(86, 39, 7, 7, BRAND_RED_RGB);
  text('Thank you!', 100, 39, 10, 'F1', '0.12 0.12 0.12');
  text('ijabikenm@gmail.com', 320, 39, 7, 'F1', '0.25 0.25 0.25');
  text('+2348148192201', 420, 39, 7, 'F1', '0.25 0.25 0.25');

  if (terms.length > 0) {
    text(label === 'INVOICE' ? 'Notes' : 'Terms', 86, Math.max(y - 2, 220), 8, 'F2', BRAND_RED_RGB);
    terms.forEach((termLine, index) => {
      text(termLine, 86, Math.max(y - 18 - index * 12, 196), 8, 'F1', '0.28 0.28 0.28');
    });
  }

  const content = commands.join('\n');

  const imageObjectNumber = logo ? 6 : null;
  const contentObjectNumber = logo ? 7 : 6;
  const imageResource = logo ? `/XObject << /Logo ${imageObjectNumber} 0 R >>` : '';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${imageResource} >> /Contents ${contentObjectNumber} 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  if (logo) {
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${logo.hex.length + 1} >>\nstream\n${logo.hex}>\nendstream`
    );
  }
  objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);

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
  const detailLabel = doc.document_type === 'contract' ? 'Agreement' : 'Service';
  const itemRows = getDocumentLines(doc)
    .map(
      (item, index) => `
        <tr>
          <td width="55%" style="padding:14px 12px 14px 0;border-top:1px solid #dedbd3;color:#151515;font-size:13px;line-height:1.45;font-weight:${index === 0 ? '700' : '400'};word-break:break-word;">${escapeHtml(item)}</td>
          <td width="20%" style="padding:14px 8px;border-top:1px solid #dedbd3;color:#6f6f6f;font-size:12px;line-height:1.45;text-align:center;">${index === 0 ? detailLabel : 'Item'}</td>
          <td width="25%" style="padding:14px 0 14px 12px;border-top:1px solid #dedbd3;color:${index === 0 && amount ? '#920110' : '#6f6f6f'};font-size:13px;line-height:1.45;font-weight:${index === 0 ? '700' : '400'};text-align:right;white-space:nowrap;">${index === 0 && amount ? escapeHtml(amount) : '-'}</td>
        </tr>
      `
    )
    .join('');
  return `
    <body style="margin:0;padding:0;background:#f5f3ee;color:#151515;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f5f3ee;">
        <tr>
          <td align="center" style="padding:24px 12px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid #e1ded6;">
              <tr>
                <td style="padding:34px 38px 28px;background:#ffffff;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td valign="middle" style="padding:0 0 38px;">
                        <img src="cid:moyo-logo" width="82" alt="Moyo" style="display:block;width:82px;height:auto;border:0;outline:none;text-decoration:none;" />
                      </td>
                      <td valign="middle" align="right" style="padding:0 0 38px;">
                        <h1 style="margin:0;color:#111111;font-size:22px;line-height:1.2;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(label)}</h1>
                        <p style="margin:8px 0 0;color:#777777;font-size:12px;line-height:1.5;">Moyo-${doc.id}</p>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td valign="top" width="52%" style="padding:0 20px 34px 0;">
                        <h2 style="margin:0 0 10px;color:#111111;font-size:17px;line-height:1.3;">${escapeHtml(doc.client_name || 'Client Name')}</h2>
                        <p style="margin:0;color:#555555;font-size:13px;line-height:1.65;">${escapeHtml(doc.title)}<br/>${escapeHtml(doc.client_email)}</p>
                      </td>
                      <td valign="top" width="48%" align="right" style="padding:0 0 34px 20px;color:#555555;font-size:13px;line-height:1.65;">
                        <strong style="color:#111111;">Ijabiken Moyo</strong><br/>
                        Photography & Fine Art<br/>
                        ijabikenm@gmail.com
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">
                    <thead>
                      <tr>
                        <th width="55%" align="left" style="padding:0 12px 12px 0;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Description</th>
                        <th width="20%" align="center" style="padding:0 8px 12px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Details</th>
                        <th width="25%" align="right" style="padding:0 0 12px 12px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 38px 34px;background:#eceae3;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border-top:1px solid #cbc7bd;border-bottom:1px solid #cbc7bd;">
                    <tr>
                      <td valign="top" width="39%" style="padding:18px 12px 18px 0;">
                        <p style="margin:0 0 10px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Payment info</p>
                        <p style="margin:0;color:#222222;font-size:12px;line-height:1.6;">Bank transfer / studio confirmation<br/>Reference: Moyo-${doc.id}</p>
                      </td>
                      <td valign="top" width="25%" style="padding:18px 12px;">
                        <p style="margin:0 0 10px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Due by</p>
                        <p style="margin:0;color:#111111;font-size:14px;line-height:1.4;">${escapeHtml(doc.due_date || 'On receipt')}</p>
                      </td>
                      <td valign="top" width="36%" align="right" style="padding:18px 0 18px 12px;">
                        <p style="margin:0 0 10px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">Total due</p>
                        <p style="margin:0;color:#920110;font-size:20px;line-height:1.25;font-weight:700;">${escapeHtml(amount || 'To be confirmed')}</p>
                      </td>
                    </tr>
                  </table>
                  ${doc.terms ? `<p style="margin:22px 0 0;color:#555555;font-size:12px;line-height:1.7;white-space:pre-line;">${escapeHtml(doc.terms)}</p>` : ''}
                  <p style="margin:26px 0 0;color:#222222;font-size:13px;line-height:1.6;">Thank you! A PDF copy is attached.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
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
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    if (!cleaned) return null;
    return {
      title: 'Photography Invoice Draft',
      lineItems: cleaned,
      terms: 'Payment is due according to the agreed schedule. Final delivery follows studio confirmation.',
    };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return {
      title: normalize(parsed.title),
      lineItems: normalize(parsed.lineItems),
      terms: normalize(parsed.terms),
    };
  } catch {
    const title = cleaned.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || '';
    const lineItems = cleaned.match(/"lineItems"\s*:\s*"([\s\S]*?)"\s*,\s*"terms"/)?.[1] || '';
    const terms = cleaned.match(/"terms"\s*:\s*"([\s\S]*?)"\s*\}/)?.[1] || '';
    if (!title && !lineItems && !terms) return null;
    return {
      title: title.replace(/\\n/g, '\n'),
      lineItems: lineItems.replace(/\\n/g, '\n'),
      terms: terms.replace(/\\n/g, '\n'),
    };
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
      'lineItems must not be empty. Write 2 to 4 short plain-text service lines based on the brief.',
      'terms must not be empty. Write concise payment, delivery, and usage terms in plain text.',
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
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 520,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              lineItems: { type: 'STRING' },
              terms: { type: 'STRING' },
            },
            required: ['title', 'lineItems', 'terms'],
          },
        },
      }),
    });
    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) return NextResponse.json({ error: 'Gemini could not generate this document.' }, { status: 502 });

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
    const draft = parseGeminiDraft(text);
    if (!draft) return NextResponse.json({ error: 'Gemini returned an unusable draft.' }, { status: 502 });
    return NextResponse.json({
      draft: {
        title: draft.title || title,
        lineItems: draft.lineItems || lineItems || 'Photography services.',
        terms: draft.terms || terms || 'Payment is due according to the agreed schedule.',
      },
    });
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
  const id = normalizeId(body.id);
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
    const logoAttachment = getLogoAttachment();
    await transporter.sendMail({
      from: config.from,
      to: doc.client_email,
      subject: `${label}: ${doc.title}`,
      text: documentText(doc),
      html: emailHtml(doc),
      attachments: [
        ...(logoAttachment ? [logoAttachment] : []),
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
