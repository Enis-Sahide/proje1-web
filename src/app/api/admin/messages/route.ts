import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contactMessages } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { desc, eq, and, sql, or, ilike } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // 'unread' | 'read' | 'replied' | 'all'
    const categoryFilter = searchParams.get('category');
    const searchQuery = searchParams.get('search')?.trim();

    // Filtreleme koşulları
    const conditions = [];

    if (statusFilter && statusFilter !== 'all') {
      conditions.push(eq(contactMessages.status, statusFilter));
    }

    if (categoryFilter && categoryFilter !== 'all') {
      conditions.push(eq(contactMessages.subjectCategory, categoryFilter));
    }

    if (searchQuery) {
      const q = `%${searchQuery}%`;
      conditions.push(
        or(
          ilike(contactMessages.name, q),
          ilike(contactMessages.email, q),
          ilike(contactMessages.message, q),
          ilike(contactMessages.orderCode, q)
        )
      );
    }

    const query = db
      .select()
      .from(contactMessages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contactMessages.createdAt));

    const messages = await query;

    // Sayaç / İstatistikler
    const allMessages = await db.select({
      id: contactMessages.id,
      status: contactMessages.status,
    }).from(contactMessages);

    const stats = {
      total: allMessages.length,
      unread: allMessages.filter(m => m.status === 'unread').length,
      read: allMessages.filter(m => m.status === 'read').length,
      replied: allMessages.filter(m => m.status === 'replied').length,
    };

    return NextResponse.json({
      success: true,
      data: messages,
      stats,
    });
  } catch (error: unknown) {
    console.error('[Admin Messages API GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar listelenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
