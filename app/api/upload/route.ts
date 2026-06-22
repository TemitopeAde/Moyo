import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function safeFileName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${unique}-${base || 'upload'}${ext || '.jpg'}`;
}

async function saveLocalUpload(file: File, buffer: Buffer) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = safeFileName(file.name);
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    console.log('[upload] request received', {
      hasAdminHeader: !!req.headers.get('x-admin-key'),
      cloudinaryConfigured,
    });
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      console.warn('[upload] no file in formData');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    console.log('[upload] file meta', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!cloudinaryConfigured) {
      const url = await saveLocalUpload(file, buffer);
      console.log('[upload] saved local file', { url });
      return NextResponse.json({ url });
    }

    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'moyo-admin', resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('[upload] cloudinary error', error);
            reject(error);
          } else if (result) {
            console.log('[upload] cloudinary result', {
              assetId: result.asset_id,
              publicId: result.public_id,
              bytes: result.bytes,
              secureUrl: Boolean(result.secure_url),
            });
            resolve(result);
          } else {
            reject(new Error('Cloudinary returned no upload result'));
          }
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: upload.secure_url });
  } catch (error) {
    console.error('[upload] Cloudinary upload failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
