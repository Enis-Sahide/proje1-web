import { NextRequest, NextResponse } from 'next/server';
import { CareerEngine } from '@/features/astrology/engine/CareerEngine';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import { getAuthPayload } from '@/lib/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getAccount } from '@/lib/auth/account';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, birthDate, birthTime, birthCity } = body;

    if (!fullName || !birthDate || !birthCity) {
      return NextResponse.json(
        { error: 'Ad Soyad, Doğum Tarihi ve Doğum Yeri zorunludur.' },
        { status: 400 }
      );
    }

    const cityData: AstroCity = typeof birthCity === 'string'
      ? ASTRO_CITIES.find(c => c.name.toLowerCase() === birthCity.toLowerCase()) || ASTRO_CITIES[0]
      : birthCity;

    let result = await CareerEngine.analyze(
      fullName.trim(),
      birthDate,
      birthTime || '12:00',
      cityData
    );

    // Oturum ve Yetki Doğrulama (Master, Admin veya Satın Almış kullanıcı)
    let payload = await getAuthPayload(req);
    if (!payload) {
      const cookieToken = req.cookies.get('access_token')?.value;
      if (cookieToken) {
        payload = await verifyAccessToken(cookieToken);
      }
    }

    let isMasterOrAdmin = false;
    let userEmail = payload?.email || '';

    if (payload?.sub) {
      try {
        const account = await getAccount(payload.sub);
        if (account) {
          if (account.role === 'master' || account.role === 'admin') {
            isMasterOrAdmin = true;
          }
          if (account.email) {
            userEmail = account.email;
          }
        }
      } catch (accErr) {
        console.error('Error fetching account for career auth:', accErr);
      }
    }

    if (!isMasterOrAdmin && payload && (payload.role === 'master' || payload.role === 'admin')) {
      isMasterOrAdmin = true;
    }
    
    let hasPurchased = false;
    if (userEmail) {
      try {
        const [order] = await db
          .select({ id: guestOrders.id })
          .from(guestOrders)
          .where(
            and(
              eq(guestOrders.email, userEmail.toLowerCase()),
              eq(guestOrders.paymentStatus, 'success'),
              or(
                eq(guestOrders.analysisType, 'career'),
                eq(guestOrders.analysisType, 'kariyer')
              )
            )
          )
          .limit(1);
        if (order) hasPurchased = true;
      } catch (dbErr) {
        console.error('Error checking user career purchases:', dbErr);
      }
    }

    const isUnlocked = Boolean(isMasterOrAdmin || hasPurchased);

    result = {
      ...result,
      isUnlocked
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Career calculation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Mesleki analiz hesaplanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
