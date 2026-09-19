import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

const DEFAULT_SUPABASE_URL = 'https://mbqjklupfoqbcfxusigs.supabase.co';
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWprbHVwZm9xYmNmeHVzaWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU2MDA4NSwiZXhwIjoyMDk0MTM2MDg1fQ.HcGzOdrjgf_NwWF-6YALN1rYWIGRBMz0Z6UzKqRjxvc';

// POST /api/admin/upload
// Admin: Uploads and optimizes a cover image directly to Supabase Cloud Storage.
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

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3) Process and optimize image with sharp
    // Standard 1200x630 (16:9 / OpenGraph standard) progressive JPEG
    const optimizedBuffer = await sharp(rawBuffer)
      .resize(1200, 630, { fit: 'cover' })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    const uniqueFilename = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

    const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY;

    // 4) Upload directly to Supabase Storage (app-assets/blog)
    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/app-assets/blog/${uniqueFilename}`;
    const storageRes = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
      body: new Uint8Array(optimizedBuffer),
    });

    if (storageRes.ok) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/app-assets/blog/${uniqueFilename}`;
      return json({ url: publicUrl });
    }

    console.warn('Supabase upload failed, falling back to local storage:', await storageRes.text());

    // Fallback: Store locally in public/uploads if cloud upload fails
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const finalPath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(finalPath, optimizedBuffer);

    return json({ url: `/uploads/${uniqueFilename}` });
  } catch (error: any) {
    console.error('Admin Upload Error:', error);
    return errorJson('Görsel yüklenirken bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
