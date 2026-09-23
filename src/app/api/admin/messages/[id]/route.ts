import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contactMessages } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Geçersiz durum değeri.' }, { status: 400 });
    }

    await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id));

    return NextResponse.json({ success: true, message: 'Mesaj durumu güncellendi.' });
  } catch (error: unknown) {
    console.error('[Admin Message PATCH Error]:', error);
    return NextResponse.json({ success: false, error: 'İşlem başarısız.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { id } = await params;

    await db.delete(contactMessages).where(eq(contactMessages.id, id));

    return NextResponse.json({ success: true, message: 'Mesaj silindi.' });
  } catch (error: unknown) {
    console.error('[Admin Message DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Mesaj silinemedi.' }, { status: 500 });
  }
}
