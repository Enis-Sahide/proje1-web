import 'server-only';
import { createHash } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatRooms, sessions } from '@/db/schema';
import { getAuthPayload, readRefreshCookie } from '@/lib/auth/session';

export async function resolveChatUserId(request: Request): Promise<string | null> {
  const payload = await getAuthPayload(request);
  if (payload?.sub) {
    return payload.sub;
  }

  const refreshToken = readRefreshCookie(request);
  if (!refreshToken) {
    return null;
  }

  try {
    const hash = createHash('sha256').update(refreshToken).digest('hex');
    const [row] = await db.select().from(sessions).where(eq(sessions.refreshTokenHash, hash));
    if (!row || row.expiresAt.getTime() < Date.now()) {
      return null;
    }
    if (row.revokedAt) {
      const revokedSecsAgo = (Date.now() - row.revokedAt.getTime()) / 1000;
      if (revokedSecsAgo > 60) {
        return null;
      }
    }
    return row.userId;
  } catch {
    return null;
  }
}

export interface SeedRoom {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colorHex: string;
  sortOrder: number;
}

export const DEFAULT_CHAT_ROOMS: SeedRoom[] = [
  {
    id: 'genel-meydan',
    title: 'Genel Meydan',
    subtitle: 'Tanışma & Günlük Paylaşımlar',
    description: '7Layers yolcularının tanışma, selamlaşma ve günlük ruhsal deneyimlerini paylaştığı ortak meclis.',
    icon: '🏛️',
    colorHex: '#D4AF37',
    sortOrder: 1,
  },
  {
    id: 'kabala',
    title: 'Kabala & Hayat Ağacı',
    subtitle: '10 Sefirot, 4 Alem & Zohar',
    description: 'Hayat Ağacı küreleri (Sefirot), 22 İbrani harfi, 4 Kabalistik alem ve Zohar öğretileri üzerine derin tartışmalar.',
    icon: '🌳',
    colorHex: '#A855F7',
    sortOrder: 2,
  },
  {
    id: 'sembolizm',
    title: 'Sembolizm & Arketipler',
    subtitle: 'Kadim Semboller, Rüyalar & Okült Tarih',
    description: 'Kutsal geometri, hermetik semboller, mitolojik arketipler ve rüya sembolizmi çözümlemeleri.',
    icon: '👁️',
    colorHex: '#F59E0B',
    sortOrder: 3,
  },
  {
    id: 'astroloji',
    title: 'Astroloji & Gökyüzü Meclisi',
    subtitle: 'Doğum Haritası, Transitler & Tutulmalar',
    description: 'Anlık gökyüzü açıları, yeniay/dolunay portalları, tutulmalar ve ezoterik doğum haritası paylaşımları.',
    icon: '🪐',
    colorHex: '#0EA5E9',
    sortOrder: 4,
  },
  {
    id: 'human-design',
    title: 'Human Design & I-Ching',
    subtitle: 'Tip, Strateji, Otorite & 64 Kapı',
    description: 'Jeneratör, Projektör, Manifestör, Reflektör deneyimleri, enkarnasyon haçları ve Rave I-Ching kapıları.',
    icon: '🧬',
    colorHex: '#10B981',
    sortOrder: 5,
  },
  {
    id: 'numeroloji',
    title: 'Numeroloji & Fonetik',
    subtitle: 'İsim Analizi, Sayı Sekansları & Titreşim',
    description: 'Pisagor ve Keldani numerolojisi, isimlerin fonetik çakra rezonansı ve tekrarlayan sayı sekansları.',
    icon: '🔢',
    colorHex: '#EC4899',
    sortOrder: 6,
  },
  {
    id: 'kelt-druid',
    title: 'Kelt Druid & Doğa Bilgeliği',
    subtitle: 'Kutsal Ağaç Takvimi & Doğa Döngüleri',
    description: 'Ogham alfabesi, 21 kutsal Kelt ağacı, mevsim geçişleri ve kadim doğa ritüelleri.',
    icon: '🌿',
    colorHex: '#34D399',
    sortOrder: 7,
  },
  {
    id: 'cakra-sifa',
    title: '7 Çakra & Ruhsal Şifa',
    subtitle: 'Meditasyon, Nefes, Frekans & Schumann',
    description: '7 enerji merkezi, nefes teknikleri, Solfeggio frekansları, Schumann rezonansı ve ruhsal şifa pratikleri.',
    icon: '⚡',
    colorHex: '#6366F1',
    sortOrder: 8,
  },
];

let isInitialized = false;

export async function ensureChatReady(runCommunityEngine = true) {
  if (isInitialized) {
    if (runCommunityEngine) {
      try {
        const { ensureCommunitySeededAndActive } = await import('./communitySeed');
        await ensureCommunitySeededAndActive();
      } catch {
        // ignore
      }
    }
    return;
  }
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        color_hex TEXT NOT NULL DEFAULT '#D4AF37',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        nickname TEXT,
        expo_push_token TEXT,
        is_muted BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      ALTER TABLE chat_profiles
      ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        reply_to_id UUID,
        reply_preview_name TEXT,
        reply_preview_text TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
      ON chat_messages (room_id, created_at DESC);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
        room_title TEXT NOT NULL,
        room_icon TEXT NOT NULL DEFAULT '💬',
        message_id UUID NOT NULL,
        message_preview TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_notifications_recipient
      ON chat_notifications (recipient_user_id, is_read, created_at DESC);
    `);

    for (const room of DEFAULT_CHAT_ROOMS) {
      await db
        .insert(chatRooms)
        .values(room)
        .onConflictDoUpdate({
          target: chatRooms.id,
          set: {
            title: room.title,
            subtitle: room.subtitle,
            description: room.description,
            icon: room.icon,
            colorHex: room.colorHex,
            sortOrder: room.sortOrder,
          },
        });
    }

    isInitialized = true;
    if (runCommunityEngine) {
      const { ensureCommunitySeededAndActive } = await import('./communitySeed');
      await ensureCommunitySeededAndActive();
    } else {
      void import('./communitySeed').then(({ ensureCommunitySeededAndActive }) =>
        ensureCommunitySeededAndActive().catch(() => {})
      );
    }
  } catch (err) {
    console.error('[ensureChatReady] Error:', err);
  }
}

export async function sendExpoPushNotification(
  expoPushToken: string | null | undefined,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      }),
    });
  } catch (err) {
    console.warn('[sendExpoPushNotification] Failed:', err);
  }
}

export function formatSafeDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
  nickname: string | null | undefined
): string {
  if (nickname && nickname.trim().length >= 2) {
    return nickname.trim();
  }
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    if (parts.length > 1) {
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${first} ${lastInitial}.`;
    }
    return first;
  }
  if (email) {
    const prefix = email.split('@')[0] || 'Yolcu';
    const clean = prefix.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g, '');
    if (clean.length >= 3) {
      return clean.slice(0, 3).charAt(0).toUpperCase() + clean.slice(1, 3) + '***';
    }
  }
  return 'Kadim Yolcu';
}

export const ROLE_TITLES: Record<string, string> = {
  free: 'Arayışta',
  apprentice: 'Çırak',
  journeyman: 'Kalfa',
  master: 'Üstad',
  admin: 'Kurucu & Rehber',
};

const BLOCKED_WORDS = [
  'amk', 'aq', 'sikik', 'sikeyim', 'siktir', 'orospu', 'piç', 'yavşak', 'götveren', 'ibne', 'kahpe'
];

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-z0-9-]+\.(com|net|org|tr|io|me|gg|xyz|ru|bet|casino)\b)/i;

export function validateChatMessageContent(raw: string): { valid: boolean; cleaned?: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Mesaj içeriği boş olamaz.' };
  }
  const trimmed = raw.trim().replace(/\s{3,}/g, '  ');
  if (trimmed.length < 1) {
    return { valid: false, error: 'Lütfen bir mesaj yazın.' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Mesajınız en fazla 500 karakter olabilir.' };
  }
  if (URL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Güvenlik gereği sohbet odalarında dış bağlantı (link) paylaşılamaz.' };
  }
  const lower = trimmed.toLocaleLowerCase('tr-TR');
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`(^|\\s|[^a-zA-ZğüşöçıİĞÜŞÖÇ])${word}($|\\s|[^a-zA-ZğüşöçıİĞÜŞÖÇ])`, 'i');
    if (regex.test(lower)) {
      return { valid: false, error: 'Lütfen meclis adabına uygun bir dil kullanınız.' };
    }
  }
  return { valid: true, cleaned: trimmed };
}

export function validateNickname(raw: string): { valid: boolean; cleaned?: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { valid: true, cleaned: '' }; // Empty clears nickname back to masked name
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { valid: true, cleaned: '' };
  }
  if (trimmed.length < 3 || trimmed.length > 22) {
    return { valid: false, error: 'Rumuz 3 ile 22 karakter arasında olmalıdır.' };
  }
  if (!/^[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_.\-\s]+$/.test(trimmed)) {
    return { valid: false, error: 'Rumuz yalnızca harf, rakam, boşluk ve (_ - .) içerebilir.' };
  }
  const lower = trimmed.toLocaleLowerCase('tr-TR');
  if (lower.includes('admin') || lower.includes('kurucu') || lower.includes('7layers') || lower.includes('yönetici')) {
    return { valid: false, error: 'Bu rumuz sistem yöneticilerine ayrılmıştır.' };
  }
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { valid: false, error: 'Lütfen uygun bir rumuz seçiniz.' };
    }
  }
  return { valid: true, cleaned: trimmed };
}
