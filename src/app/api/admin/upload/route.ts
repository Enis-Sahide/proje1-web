import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

// POST /api/admin/upload
// Admin: Uploads and optimizes a cover image.
export async function POST(request: Request) {
  try {
    // 1) Authenticate and authorize admin role
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Yetkisiz', 401);
    const me = await getAccount(payload.sub);
    if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

    // 2) Get Form Data file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return errorJson('Yüklenecek dosya bulunamadı.', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename using timestamp
    const fileExtension = '.jpg'; // Store all optimized images as progressive JPEGs
    const uniqueFilename = `blog-${Date.now()}${fileExtension}`;

    // Define path in Next.js public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const finalPath = path.join(uploadsDir, uniqueFilename);

    // 3) Process and optimize image with sharp
    // Standard Open Graph: 1200x630, Quality: 80, Progressive JPEG for fast and clean social previews
    await sharp(buffer)
      .resize(1200, 630, { fit: 'cover' })
      .jpeg({ quality: 80, progressive: true })
      .toFile(finalPath);

    const fileUrl = `/uploads/${uniqueFilename}`;

    return json({ url: fileUrl });
  } catch (error: any) {
    console.error('Admin Upload Error:', error);
    return errorJson('Görsel yüklenirken bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
