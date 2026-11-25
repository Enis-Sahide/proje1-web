import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { ensureBioLinksTable, listBioLinks } from '@/lib/bioLinks';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    const links = await listBioLinks(false);
    return json({ success: true, links });
  } catch (err) {
    console.error('[GET /api/admin/bio-links] Error:', err);
    return errorJson('Bağlantılar okunamadı', 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    await ensureBioLinksTable();

    const body = await request.json().catch(() => ({}));
    const rawId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : `link_${Date.now()}`;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const subtitle = typeof body.subtitle === 'string' && body.subtitle.trim() ? body.subtitle.trim() : null;
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const iconKey = typeof body.iconKey === 'string' && body.iconKey.trim() ? body.iconKey.trim() : 'globe';
    const badgeText = typeof body.badgeText === 'string' && body.badgeText.trim() ? body.badgeText.trim() : null;
    const isHighlighted = Boolean(body.isHighlighted);
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100;

    if (!title) return errorJson('Link başlığı zorunludur.', 400);
    if (!url) return errorJson('Hedef URL (adres) zorunludur.', 400);

    await db.execute(sql`
      INSERT INTO bio_links (
        id, title, subtitle, url, icon_key, badge_text, is_highlighted, is_active, sort_order, updated_at
      ) VALUES (
        ${rawId},
        ${title},
        ${subtitle},
        ${url},
        ${iconKey},
        ${badgeText},
        ${isHighlighted},
        ${isActive},
        ${sortOrder},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        url = EXCLUDED.url,
        icon_key = EXCLUDED.icon_key,
        badge_text = EXCLUDED.badge_text,
        is_highlighted = EXCLUDED.is_highlighted,
        is_active = EXCLUDED.is_active,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `);

    const links = await listBioLinks(false);
    return json({ success: true, links });
  } catch (err) {
    console.error('[POST /api/admin/bio-links] Error:', err);
    return errorJson('Bağlantı kaydedilemedi.', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    await ensureBioLinksTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();
    if (!id) return errorJson('Silinecek link ID gerekli.', 400);

    await db.execute(sql`
      DELETE FROM bio_links WHERE id = ${id}
    `);

    const links = await listBioLinks(false);
    return json({ success: true, links });
  } catch (err) {
    console.error('[DELETE /api/admin/bio-links] Error:', err);
    return errorJson('Bağlantı silinemedi.', 500);
  }
}
