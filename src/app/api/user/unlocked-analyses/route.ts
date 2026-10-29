import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getAccount } from '@/lib/auth/account';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let payload = await getAuthPayload(req);
    if (!payload) {
      const cookieToken = req.cookies.get('access_token')?.value;
      if (cookieToken) {
        payload = await verifyAccessToken(cookieToken);
      }
    }

    if (!payload) {
      return NextResponse.json({
        success: true,
        isAllUnlocked: false,
        unlockedTypes: []
      });
    }

    let isMasterOrAdmin = payload.role === 'master' || payload.role === 'admin';
    let userEmail = payload.email || '';

    if (payload.sub) {
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
      } catch (e) {
        console.error('Account lookup error in unlocked-analyses:', e);
      }
    }

    if (isMasterOrAdmin) {
      return NextResponse.json({
        success: true,
        isAllUnlocked: true,
        unlockedTypes: [
          'career', 'kariyer',
          'kabbalah',
          'human-design', 'human_design',
          'astrology',
          'incarnation', 'karmic',
          'cosmic-matrix', 'cosmic_matrix',
          'numerology', 'chakra', 'druid-tree'
        ]
      });
    }

    let unlockedTypes: string[] = [];

    if (userEmail) {
      try {
        const orders = await db
          .select({ analysisType: guestOrders.analysisType })
          .from(guestOrders)
          .where(
            and(
              eq(guestOrders.email, userEmail.toLowerCase()),
              eq(guestOrders.paymentStatus, 'success')
            )
          );

        const typesSet = new Set<string>();
        orders.forEach(o => {
          if (o.analysisType) {
            typesSet.add(o.analysisType.toLowerCase());
            // Normalizasyon eşleşmeleri
            if (o.analysisType === 'career' || o.analysisType === 'kariyer') {
              typesSet.add('career');
              typesSet.add('kariyer');
            }
            if (o.analysisType === 'human-design' || o.analysisType === 'human_design') {
              typesSet.add('human-design');
              typesSet.add('human_design');
            }
            if (o.analysisType === 'cosmic-matrix' || o.analysisType === 'cosmic_matrix') {
              typesSet.add('cosmic-matrix');
              typesSet.add('cosmic_matrix');
            }
            if (o.analysisType === 'incarnation' || o.analysisType === 'karmic') {
              typesSet.add('incarnation');
              typesSet.add('karmic');
            }
          }
        });

        unlockedTypes = Array.from(typesSet);
      } catch (dbErr) {
        console.error('Error fetching unlocked analyses:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      isAllUnlocked: false,
      unlockedTypes
    });
  } catch (error: any) {
    console.error('unlocked-analyses route error:', error);
    return NextResponse.json({
      success: false,
      isAllUnlocked: false,
      unlockedTypes: []
    }, { status: 500 });
  }
}
