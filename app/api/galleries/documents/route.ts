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

type CalculatedInvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type CalculatedInvoice = {
  structured: boolean;
  items: CalculatedInvoiceItem[];
  subtotal: number;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  discount: number;
  taxableSubtotal: number;
  taxRate: number;
  tax: number;
  total: number;
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

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'document';
}

function normalizeId(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return normalize(value);
}

function normalizeType(value: unknown) {
  return normalize(value).toLowerCase() === 'contract' ? 'contract' : 'invoice';
}

function normalizeCurrency(value: unknown) {
  const currency = normalize(value).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  return currency || 'NGN';
}

function parseAmount(value: unknown) {
  if (value === '' || value === null || value === undefined) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
}

function isValidDateInput(value: string) {
  if (!value) return true;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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

function formatMoneyWithZero(amount: string | number, currency: string) {
  const numeric = Number(amount || 0);
  if (!Number.isFinite(numeric)) return `${currency || 'NGN'} 0`;
  return `${currency || 'NGN'} ${numeric.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeInvoiceItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const description = truncate(normalize(record.description), 220);
      const parsedQuantity = parseAmount(record.quantity);
      const parsedUnitPrice = parseAmount(record.unitPrice);
      const quantity = Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : 0;
      const unitPrice = Number.isFinite(parsedUnitPrice) ? Math.max(0, parsedUnitPrice) : 0;
      if (!description && quantity <= 0 && unitPrice <= 0) return null;
      return { description, quantity, unitPrice };
    })
    .filter(Boolean)
    .slice(0, 20) as Array<{ description: string; quantity: number; unitPrice: number }>;
}

function calculateInvoiceDetails(options: {
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  discountType?: unknown;
  discountValue?: unknown;
  taxRate?: unknown;
}) {
  const items = options.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountType: 'fixed' | 'percent' = normalize(options.discountType) === 'percent' ? 'percent' : 'fixed';
  const parsedDiscount = parseAmount(options.discountValue);
  const rawDiscount = Number.isFinite(parsedDiscount) ? Math.max(0, parsedDiscount) : 0;
  const discount =
    discountType === 'percent'
      ? Math.min(subtotal, subtotal * Math.min(rawDiscount, 100) / 100)
      : Math.min(subtotal, rawDiscount);
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const parsedTaxRate = parseAmount(options.taxRate);
  const taxRate = Number.isFinite(parsedTaxRate) ? Math.max(0, parsedTaxRate) : 0;
  const tax = taxableSubtotal * taxRate / 100;
  const total = taxableSubtotal + tax;

  return {
    structured: true,
    items,
    subtotal,
    discountType,
    discountValue: rawDiscount,
    discount,
    taxableSubtotal,
    taxRate,
    tax,
    total,
  };
}

function encodeInvoiceDetails(details: CalculatedInvoice) {
  return JSON.stringify({
    version: 1,
    kind: 'calculated-invoice',
    items: details.items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })),
    discountType: details.discountType,
    discountValue: details.discountValue,
    taxRate: details.taxRate,
  });
}

function getCalculatedInvoice(doc: GalleryDocument): CalculatedInvoice | null {
  try {
    const parsed = JSON.parse(doc.line_items || '');
    if (!parsed || parsed.kind !== 'calculated-invoice') return null;
    const items = normalizeInvoiceItems(parsed.items);
    if (!items.length) return null;
    return calculateInvoiceDetails({
      items,
      discountType: parsed.discountType,
      discountValue: parsed.discountValue,
      taxRate: parsed.taxRate,
    });
  } catch {
    return null;
  }
}

function documentText(doc: GalleryDocument) {
  const label = doc.document_type === 'contract' ? 'Contract' : 'Invoice';
  const calculation = getCalculatedInvoice(doc);
  const amount = formatMoney(calculation?.total ?? doc.amount, doc.currency);
  const itemText = calculation
    ? [
        ...calculation.items.map((item) =>
          `${item.description} | Qty ${item.quantity} | Unit ${formatMoneyWithZero(item.unitPrice, doc.currency)} | Total ${formatMoneyWithZero(item.total, doc.currency)}`
        ),
        `Subtotal: ${formatMoneyWithZero(calculation.subtotal, doc.currency)}`,
        `Discount: -${formatMoneyWithZero(calculation.discount, doc.currency)}`,
        `Tax${calculation.taxRate ? ` (${calculation.taxRate}%)` : ''}: ${formatMoneyWithZero(calculation.tax, doc.currency)}`,
        `Total: ${formatMoneyWithZero(calculation.total, doc.currency)}`,
      ].join('\n')
    : doc.line_items || (doc.document_type === 'contract' ? 'Agreement details to be confirmed by both parties.' : 'Photography services.');
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
    itemText,
    '',
    doc.terms || 'Contract terms, usage rights, payment, and delivery notes to be confirmed.',
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
      if (word.length > max) {
        if (current) {
          lines.push(current);
          current = '';
        }
        for (let index = 0; index < word.length; index += max) {
          lines.push(word.slice(index, index + max));
        }
        continue;
      }
      if (`${current} ${word}`.trim().length > max) {
        if (current) lines.push(current);
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
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/×/g, 'x')
    .replace(/₦/g, 'NGN ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function getDocumentLines(doc: GalleryDocument) {
  const calculation = getCalculatedInvoice(doc);
  if (calculation) return calculation.items.map((item) => item.description).filter(Boolean).slice(0, 6);

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
  const calculation = getCalculatedInvoice(doc);
  const amount = formatMoney(calculation?.total ?? doc.amount, doc.currency);
  const createdAt = doc.created_at ? new Date(doc.created_at) : new Date();
  const createdDate = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = getDocumentLines(doc);
  const terms = wrapText(doc.terms || 'Contract terms, usage rights, payment, and delivery notes to be confirmed.', 62);
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
  const pdfItems = calculation
    ? calculation.items.slice(0, 6)
    : lines.map((item, index) => ({
        description: item,
        quantity: index === 0 ? 1 : 0,
        unitPrice: index === 0 ? Number(doc.amount || 0) : 0,
        total: index === 0 ? Number(doc.amount || 0) : 0,
      }));

  pdfItems.forEach((item, index) => {
    const itemLines = wrapText(item.description, 36).slice(0, 2);
    text(itemLines[0] || item.description, 86, y, 9, index === 0 ? 'F2' : 'F1');
    if (itemLines[1]) text(itemLines[1], 86, y - 13, 8, 'F1', '0.35 0.35 0.35');
    text(calculation ? `Qty ${item.quantity}` : index === 0 ? (label === 'INVOICE' ? 'Service' : 'Agreement') : 'Item', 338, y, 8, 'F1', '0.35 0.35 0.35');
    text(item.total > 0 ? formatMoneyWithZero(item.total, doc.currency) : '-', 462, y, 9, index === 0 ? 'F2' : 'F1', item.total > 0 ? BRAND_RED_RGB : '0.35 0.35 0.35');
    y -= itemLines[1] ? 34 : 26;
  });

  if (calculation) {
    y -= 4;
    line(338, y + 12, 526, y + 12, '0.86 0.86 0.84', 0.6);
    text('Subtotal', 338, y, 8, 'F1', '0.35 0.35 0.35');
    text(formatMoneyWithZero(calculation.subtotal, doc.currency), 462, y, 8, 'F1', '0.20 0.20 0.20');
    y -= 16;
    text('Discount', 338, y, 8, 'F1', '0.35 0.35 0.35');
    text(`-${formatMoneyWithZero(calculation.discount, doc.currency)}`, 462, y, 8, 'F1', '0.20 0.20 0.20');
    y -= 16;
    text(`Tax${calculation.taxRate ? ` (${calculation.taxRate}%)` : ''}`, 338, y, 8, 'F1', '0.35 0.35 0.35');
    text(formatMoneyWithZero(calculation.tax, doc.currency), 462, y, 8, 'F1', '0.20 0.20 0.20');
  }

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
    const notesTitleY = Math.max(y - 2, 270);
    const availableLines = Math.max(1, Math.floor((notesTitleY - 252) / 12));
    text(label === 'INVOICE' ? 'Contract / Terms' : 'Terms', 86, notesTitleY, 8, 'F2', BRAND_RED_RGB);
    terms.slice(0, availableLines).forEach((termLine, index) => {
      text(termLine, 86, notesTitleY - 16 - index * 12, 8, 'F1', '0.28 0.28 0.28');
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
  const calculation = getCalculatedInvoice(doc);
  const amount = formatMoney(calculation?.total ?? doc.amount, doc.currency);
  const label = doc.document_type === 'contract' ? 'Contract' : 'Invoice';
  const detailLabel = doc.document_type === 'contract' ? 'Agreement' : 'Service';
  const emailItems = calculation
    ? calculation.items
    : getDocumentLines(doc).map((item, index) => ({
        description: item,
        quantity: index === 0 ? 1 : 0,
        total: index === 0 ? Number(doc.amount || 0) : 0,
      }));
  const itemRows = emailItems
    .map(
      (item, index) => `
        <tr>
          <td width="55%" style="padding:14px 12px 14px 0;border-top:1px solid #dedbd3;color:#151515;font-size:13px;line-height:1.45;font-weight:${index === 0 ? '700' : '400'};word-break:break-word;">${escapeHtml(item.description)}</td>
          <td width="20%" style="padding:14px 8px;border-top:1px solid #dedbd3;color:#6f6f6f;font-size:12px;line-height:1.45;text-align:center;">${calculation ? `Qty ${item.quantity}` : index === 0 ? detailLabel : 'Item'}</td>
          <td width="25%" style="padding:14px 0 14px 12px;border-top:1px solid #dedbd3;color:${item.total > 0 ? '#920110' : '#6f6f6f'};font-size:13px;line-height:1.45;font-weight:${item.total > 0 ? '700' : '400'};text-align:right;white-space:nowrap;">${item.total > 0 ? escapeHtml(formatMoneyWithZero(item.total, doc.currency)) : '-'}</td>
        </tr>
      `
    )
    .join('');
  const summaryRows = calculation
    ? `
      <tr>
        <td colspan="2" align="right" style="padding:14px 12px 0 0;color:#555555;font-size:12px;line-height:1.5;">Subtotal</td>
        <td align="right" style="padding:14px 0 0 12px;color:#222222;font-size:12px;line-height:1.5;white-space:nowrap;">${escapeHtml(formatMoneyWithZero(calculation.subtotal, doc.currency))}</td>
      </tr>
      <tr>
        <td colspan="2" align="right" style="padding:8px 12px 0 0;color:#555555;font-size:12px;line-height:1.5;">Discount</td>
        <td align="right" style="padding:8px 0 0 12px;color:#222222;font-size:12px;line-height:1.5;white-space:nowrap;">-${escapeHtml(formatMoneyWithZero(calculation.discount, doc.currency))}</td>
      </tr>
      <tr>
        <td colspan="2" align="right" style="padding:8px 12px 0 0;color:#555555;font-size:12px;line-height:1.5;">Tax${calculation.taxRate ? ` (${calculation.taxRate}%)` : ''}</td>
        <td align="right" style="padding:8px 0 0 12px;color:#222222;font-size:12px;line-height:1.5;white-space:nowrap;">${escapeHtml(formatMoneyWithZero(calculation.tax, doc.currency))}</td>
      </tr>
    `
    : '';
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
                    <tbody>${itemRows}${summaryRows}</tbody>
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
                  ${doc.terms ? `<div style="margin:22px 0 0;padding:16px 0 0;border-top:1px solid #cbc7bd;"><p style="margin:0 0 8px;color:#777777;font-size:10px;line-height:1.3;letter-spacing:2px;text-transform:uppercase;">${label === 'Invoice' ? 'Contract / Terms' : 'Terms'}</p><p style="margin:0;color:#555555;font-size:12px;line-height:1.7;white-space:pre-line;">${escapeHtml(doc.terms)}</p></div>` : ''}
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
  const id = req.nextUrl.searchParams.get('id');
  const format = req.nextUrl.searchParams.get('format');
  const token = req.nextUrl.searchParams.get('token') || '';
  if (id && format === 'pdf') {
    const doc = await getDocument(id);
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    if (token) {
      const { rows } = await query(
        `SELECT id
         FROM bookings
         WHERE manage_token = $1
           AND gallery_id = $2
         LIMIT 1`,
        [token, doc.gallery_id]
      );
      if (!rows[0]) return NextResponse.json({ error: 'Document not available for this booking.' }, { status: 403 });
    } else {
      const unauthorized = requireAdmin(req);
      if (unauthorized) return unauthorized;
    }
    const pdf = buildPdf(doc);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(`${doc.document_type}-${doc.id}-${doc.title}`)}.pdf"`,
      },
    });
  }

  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

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

  try {
    const body = await req.json();
    const action = normalize(body.action);
    const galleryId = Number(body.galleryId);
    const documentType = normalizeType(body.documentType);
    const title =
      truncate(normalize(body.title), 140) ||
      (documentType === 'contract' ? 'Photography Contract' : 'Photography Invoice');
    const clientEmail = normalize(body.clientEmail).toLowerCase();
    const amount = parseAmount(body.amount);
    const currency = normalizeCurrency(body.currency);
    const dueDate = normalize(body.dueDate);
    const lineItems = truncate(normalize(body.lineItems), 3000);
    const terms = truncate(normalize(body.terms), 3000);
    const invoiceItems = normalizeInvoiceItems(body.items || body.invoiceItems);
    const invoiceDetails = documentType === 'invoice'
      ? calculateInvoiceDetails({
          items: invoiceItems,
          discountType: body.discountType,
          discountValue: body.discountValue,
          taxRate: body.taxRate,
        })
      : null;
    const storedAmount = invoiceDetails ? invoiceDetails.total : amount;
    const storedLineItems = invoiceDetails ? encodeInvoiceDetails(invoiceDetails) : lineItems;

    if (!Number.isInteger(galleryId) || galleryId <= 0) {
      return NextResponse.json({ error: 'Choose a gallery.' }, { status: 400 });
    }
    if (!Number.isFinite(storedAmount) || storedAmount < 0) {
      return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });
    }
    if (documentType === 'invoice' && action !== 'generate') {
      if (!invoiceItems.some((item) => item.description && item.quantity > 0 && item.unitPrice > 0)) {
        return NextResponse.json({ error: 'Add at least one invoice item with a price above zero.' }, { status: 400 });
      }
    }
    if (!/^[A-Z]{3,5}$/.test(currency)) {
      return NextResponse.json({ error: 'Enter a valid currency code.' }, { status: 400 });
    }
    if (!isValidDateInput(dueDate)) {
      return NextResponse.json({ error: 'Enter a valid due date.' }, { status: 400 });
    }

    const { rows: galleryRows } = await query('SELECT client_name FROM galleries WHERE id = $1', [galleryId]);
    const gallery = galleryRows[0];
    if (!gallery) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

    if (action === 'generate') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });

      const brief = [lineItems, terms].filter(Boolean).join('\n\n') || 'A clean photography service document.';
      const prompt = [
        `Create a concise ${documentType} draft for Ijabiken Moyo.`,
        `Client name: ${gallery.client_name}`,
        storedAmount > 0 ? `Amount: ${currency} ${storedAmount}` : '',
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
          title: truncate(draft.title || title, 140),
          lineItems: truncate(draft.lineItems || lineItems || 'Photography services.', 3000),
          terms: truncate(draft.terms || terms || 'Payment is due according to the agreed schedule.', 3000),
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
      [galleryId, documentType, title, clientEmail, storedAmount, currency, dueDate, storedLineItems, terms]
    );

    return NextResponse.json({ document: rows[0] });
  } catch (error) {
    console.error('[gallery documents] POST error', error);
    return NextResponse.json({ error: 'Unable to save this document.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
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
            filename: `${sanitizeFilename(`${doc.document_type}-${doc.id}-${doc.title}`)}.pdf`,
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
  } catch (error) {
    console.error('[gallery documents] PUT error', error);
    return NextResponse.json({ error: 'Unable to update this document.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing document id.' }, { status: 400 });
    await query('DELETE FROM gallery_documents WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[gallery documents] DELETE error', error);
    return NextResponse.json({ error: 'Unable to delete this document.' }, { status: 500 });
  }
}
