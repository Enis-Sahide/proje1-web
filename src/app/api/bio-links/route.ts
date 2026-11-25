import { json, errorJson, preflight } from '@/lib/http/cors';
import { listBioLinks } from '@/lib/bioLinks';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

export async function GET() {
  try {
    const links = await listBioLinks(true);
    return json({ success: true, links });
  } catch (err) {
    console.error('[GET /api/bio-links] Error:', err);
    return errorJson('Bağlantılar yüklenemedi.', 500);
  }
}
