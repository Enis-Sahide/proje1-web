import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import { DRUID_TREES } from '@/features/astrology/engine/DruidTreeEngine';
import { renderDruidTreeCard } from '@/features/astrology/server/druidTreeCardService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const treeId = searchParams.get('treeId');
    const name = searchParams.get('name') || '';

    if (!treeId) {
      return new Response(JSON.stringify({ error: 'treeId parametresi gereklidir' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tree = DRUID_TREES.find(t => t.id === treeId);
    if (!tree) {
      return new Response(JSON.stringify({ error: 'Geçersiz ağaç kimliği' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const staticCardPath = path.join(process.cwd(), 'public', 'druid-trees', `${tree.id}-card.jpg`);
    let imageBuffer: Buffer;
    if (fs.existsSync(staticCardPath)) {
      imageBuffer = await fs.promises.readFile(staticCardPath);
    } else {
      const rawImagePath = path.join(process.cwd(), 'public', 'druid-trees', `${tree.id}.jpg`);
      if (!fs.existsSync(rawImagePath)) {
        return new Response(JSON.stringify({ error: 'Ağaç görseli bulunamadı' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      imageBuffer = await renderDruidTreeCard(tree, rawImagePath, name);
    }

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Disposition': `inline; filename="${name ? encodeURIComponent(name) + '_' : ''}${tree.id}_card.jpg"`
      }
    });
  } catch (error) {
    console.error('Druid tree card generation error:', error);
    return new Response(JSON.stringify({ error: 'Görsel üretilirken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
