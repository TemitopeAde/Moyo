import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    console.log('[upload] request received', {
      hasAdminHeader: !!req.headers.get('x-admin-key'),
      cloudinaryConfigured: Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
      ),
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

    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'moyo-admin' },
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
