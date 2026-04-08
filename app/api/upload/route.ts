import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
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

    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'moyo-admin' },
        (error, result) => {
          if (error) {
            console.error('[upload] cloudinary error', error);
            reject(error);
          } else {
            console.log('[upload] cloudinary result', {
              assetId: (result as any)?.asset_id,
              publicId: (result as any)?.public_id,
              bytes: (result as any)?.bytes,
              secureUrl: Boolean((result as any)?.secure_url),
            });
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: (upload as any).secure_url });
  } catch (error) {
    console.error('[upload] Cloudinary upload failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
