import { NextResponse, type NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

/**
 * Sunucu tarafı admin koruması.
 *
 * Next.js 16'da `middleware` konvansiyonu `proxy` olarak yeniden adlandırıldı;
 * davranış aynı. Node.js runtime'ında çalışır, bu yüzden `jose` doğrudan kullanılabilir.
 *
 * Bu katman "iyimser kontrol"tür — asıl yetki denetimi her admin route'unun
 * içindeki `requireAdmin()` ile veritabanından yapılır. Buradaki amaç, yetkisiz
 * isteğin uygulamaya hiç girmemesi.
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

function unauthorized(message: string, status: 401 | 403) {
  return NextResponse.json({ error: message }, { status });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/admin');

  // CORS ön kontrol istekleri kimlik taşımaz; route'un kendi OPTIONS'ına bırak.
  if (request.method === 'OPTIONS') return NextResponse.next();

  const accessToken = request.cookies.get('access_token')?.value;
  const hasRefreshToken = Boolean(request.cookies.get('refresh_token')?.value);
  const payload = accessToken ? await verifyAccessToken(accessToken) : null;

  // ── Geçerli erişim tokenı yok ──
  if (!payload) {
    if (isApi) {
      // 401 döndürüyoruz ki istemcideki apiFetch /api/auth/refresh ile
      // tokenı tazeleyip isteği tekrarlasın.
      return unauthorized('Oturum doğrulanamadı', 401);
    }

    // Sayfalarda: refresh çerezi duruyorsa oturum muhtemelen canlı, sadece
    // erişim tokenının süresi dolmuş. İstemci tazeleyebilsin diye geçiriyoruz —
    // sayfa zaten veriyi sunucuda sıkı korunan /api/admin uçlarından çekiyor.
    if (hasRefreshToken) return NextResponse.next();

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Token geçerli ama yetki yok ──
  // Not: rol, token üretilirken damgalanır. Yeni yetkilendirilmiş bir yönetici
  // için token tazelenene kadar (en geç 30 dk) burası devreye girebilir.
  if (payload.role !== 'admin') {
    if (isApi) return unauthorized('Bu işlem için yönetici yetkisi gerekiyor', 403);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
