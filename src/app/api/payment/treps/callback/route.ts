import { NextResponse, type NextRequest } from 'next/server';
import { verifyPayment, getBaseUrl } from '@/lib/payment/service';

export const dynamic = 'force-dynamic';

/**
 * GET|POST /api/payment/treps/callback
 *
 * Treps, ödeme bittiğinde (başarılı/başarısız/iptal) kullanıcıyı buraya döndürür.
 * Sonucu doğrulayıp kullanıcıyı sonuç sayfasına yönlendiririz.
 *
 * Kullanıcının döndüğü isteğe değil, Treps'e sorduğumuz gerçek duruma güveniriz.
 */
async function handleCallback(request: NextRequest): Promise<NextResponse> {
  const origin = getBaseUrl();

  // Tokenı sırasıyla query, JSON gövde ve form gövdesinde ara.
  let token = request.nextUrl.searchParams.get('token');

  if (!token && request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = (await request.json()) as Record<string, string>;
        token = body.token || body.hpp_token || body.external_order_id || null;
      } else if (
        contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')
      ) {
        const form = await request.formData();
        token = (form.get('token') ||
          form.get('hpp_token') ||
          form.get('external_order_id')) as string | null;
      } else {
        const params = new URLSearchParams(await request.text());
        token =
          params.get('token') || params.get('hpp_token') || params.get('external_order_id') || null;
      }
    } catch (err) {
      console.error('[treps callback] gövde ayrıştırılamadı:', err);
    }
  }

  if (!token) {
    return NextResponse.redirect(`${origin}/checkout/result?status=error&message=Islem+bulunamadi`);
  }

  try {
    const result = await verifyPayment(token);

    if (result.status === 'completed' && result.downloadToken) {
      return NextResponse.redirect(
        `${origin}/checkout/success?token=${encodeURIComponent(result.downloadToken)}`,
      );
    }

    const params = new URLSearchParams({ status: result.status });
    if (result.error) params.set('message', result.error);
    if (result.externalOrderId) params.set('order', result.externalOrderId);
    return NextResponse.redirect(`${origin}/checkout/result?${params.toString()}`);
  } catch (err) {
    console.error('[treps callback]', err);
    return NextResponse.redirect(
      `${origin}/checkout/result?status=error&message=Durum+sorgulanamadi`,
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}
