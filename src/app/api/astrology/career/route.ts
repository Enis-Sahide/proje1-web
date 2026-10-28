import { NextRequest, NextResponse } from 'next/server';
import { CareerEngine } from '@/features/astrology/engine/CareerEngine';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import { getAuthPayload } from '@/lib/auth/session';
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
    const payload = await getAuthPayload(req);
    const isMasterOrAdmin = payload && (payload.role === 'master' || payload.role === 'admin');
    
    let hasPurchased = false;
    if (payload?.email) {
      try {
        const [order] = await db
          .select({ id: guestOrders.id })
          .from(guestOrders)
          .where(
            and(
              eq(guestOrders.email, payload.email.toLowerCase()),
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

    // Kilitli / Ücretsiz Ziyaretçi: Derin kısımları sunucu tarafında maskele (Crack-geçirmez koruma)
    if (!isUnlocked) {
      const MASKED = '🔒 Bu detaylı analiz Kapsamlı Kariyer Raporuna özeldir.';
      
      result = {
        ...result,
        isUnlocked: false,
        // İkincil İlerletim Derin Metinleri
        progressedCareer: result.progressedCareer ? {
          ...result.progressedCareer,
          progressedSun: {
            ...result.progressedCareer.progressedSun,
            explanation: MASKED
          },
          progressedMoon: {
            ...result.progressedCareer.progressedMoon,
            houseImpact: MASKED
          },
          progressedMoonPhase: {
            ...result.progressedCareer.progressedMoonPhase,
            careerHarvestGuidance: MASKED,
            stageDescription: MASKED
          }
        } : result.progressedCareer,

        // Kadersel Zaman Çizelgesi
        careerTimeline: result.careerTimeline ? {
          ...result.careerTimeline,
          milestones: result.careerTimeline.milestones.map(m => ({
            ...m,
            description: MASKED,
            actionGuidance: MASKED
          }))
        } : result.careerTimeline,

        // Ruh Haritası (Drakonik Katman)
        soulCareer: result.soulCareer ? {
          ...result.soulCareer,
          soulMaterialBridge: {
            ...result.soulCareer.soulMaterialBridge,
            synthesisAdvice: MASKED,
            unfulfillmentWarning: MASKED,
            dailySpiritualPractice: MASKED
          }
        } : result.soulCareer,

        // Servet Mıknatısı & Tükenmişlik Kalkanı
        wealthMagnet: result.wealthMagnet ? {
          ...result.wealthMagnet,
          mechanism: MASKED,
          practicalFormula: MASKED
        } : result.wealthMagnet,

        burnoutShield: result.burnoutShield ? {
          ...result.burnoutShield,
          protectionFormula: MASKED
        } : result.burnoutShield,

        // Gezegen Mesleki Deşifreleri
        planetaryInsights: result.planetaryInsights.map(p => ({
          ...p,
          explanation: MASKED
        })),

        // Kadim ve Ezoterik 6 Yeni Modülün Maskelenmesi
        musicalAffinity: result.musicalAffinity ? {
          ...result.musicalAffinity,
          musicalExpressionAdvice: MASKED,
          vocalAptitude: {
            ...result.musicalAffinity.vocalAptitude,
            chakraResonance: MASKED
          }
        } : result.musicalAffinity,

        craftsmanshipMaterial: result.craftsmanshipMaterial ? {
          ...result.craftsmanshipMaterial,
          healingPower: MASKED,
          commercialApplications: [MASKED, MASKED]
        } : result.craftsmanshipMaterial,

        parsFortunaWealth: result.parsFortunaWealth ? {
          ...result.parsFortunaWealth,
          karmicBlessingArea: MASKED,
          practicalMonetizationGuidance: MASKED
        } : result.parsFortunaWealth,

        partnershipDna: result.partnershipDna ? {
          ...result.partnershipDna,
          synergyCondition: MASKED,
          toxicPartnershipRisk: MASKED,
          idealTeamStructure: MASKED
        } : result.partnershipDna,

        planetaryProductivityHours: result.planetaryProductivityHours ? {
          ...result.planetaryProductivityHours,
          dailyRoutineAdvice: MASKED,
          rechargeAndBurnoutPreventionWindow: MASKED
        } : result.planetaryProductivityHours,

        vocationalReputation: result.vocationalReputation ? {
          ...result.vocationalReputation,
          howIndustryRemembersYou: MASKED,
          authorityTrigger: MASKED
        } : result.vocationalReputation,

        // Süper Güç, Tuzaklar & Eylem Planı
        superPower: MASKED,
        shadowPitfalls: MASKED,
        actionableGuidance: [
          '🔒 1. Stratejik Eylem Kuralı Kapsamlı Kariyer Raporuna özeldir.',
          '🔒 2. Stratejik Eylem Kuralı Kapsamlı Kariyer Raporuna özeldir.',
          '🔒 3. Stratejik Eylem Kuralı Kapsamlı Kariyer Raporuna özeldir.',
          '🔒 4. Stratejik Eylem Kuralı Kapsamlı Kariyer Raporuna özeldir.'
        ],

        // Sektörlerin Derin Açıklamaları & Rolleri
        topSectors: result.topSectors.map(s => ({
          ...s,
          description: MASKED,
          recommendedRoles: [MASKED, MASKED, MASKED]
        })),
        secondarySectors: result.secondarySectors.map(s => ({
          ...s,
          recommendedRoles: [MASKED, MASKED]
        }))
      };
    } else {
      result = {
        ...result,
        isUnlocked: true
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Career calculation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Mesleki analiz hesaplanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
