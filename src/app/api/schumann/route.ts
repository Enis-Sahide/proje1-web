import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

function getStatusInfo(kp: number) {
  if (kp < 3) {
    return {
      label: 'Dengeli Akış (Sakin)',
      desc: 'Manyetik alan oldukça dingin ve dengeli. İç gözlem, zihinsel odaklanma, derin gevşeme ve kök çakra topraklama çalışmaları için mükemmel bir zemin. Zihnin gürültüsünü yatıştırmak ve sessizlik meditasyonları yapmak için ideal bir dönem.'
    };
  } else if (kp < 4) {
    return {
      label: 'Enerjisel Kıpırdanma (Kararsız)',
      desc: 'Elektromanyetik alanda hafif bir uyanış ve hareketlilik var. Aura alanında genişleme ve hafif bir duyarlılık hissedilebilir. Prana akışını dengeleyici nefes egzersizleri ve hafif esneme hareketleri için harika bir zaman dilimi.'
    };
  } else if (kp < 5) {
    return {
      label: 'Yüksek Titreşim (Aktif)',
      desc: 'Aktif bir manyetik alan mevcut. Bilinçaltı kapıları aralanıyor; rüyaların berraklaşması, sezgilerin ve psişik duyarlılığın güçlenmesi olasıdır. Üçüncü göz çalışmaları, rüya günlükleri tutma ve durugörü meditasyonları için çok elverişli bir süreç.'
    };
  } else if (kp < 6) {
    return {
      label: 'Işık Kapısı (G1 Manyetik Aktivite)',
      desc: 'Güneş\'ten gelen yüksek frekanslı kozmik bilgi paketlerinin iyonosfere ulaştığı özel bir uyanış penceresi. Zihinde uykusuzluk veya fiziksel duyarlılık olarak yansıyan bu etki, aslında derin çakra çalışmaları, DNA aktivasyonu meditasyonları ve yüksek benlikle bağ kurmak için olağanüstü bir fırsattır.'
    };
  } else if (kp < 7) {
    return {
      label: 'Kozmik Entegrasyon (G2 Manyetik Aktivite)',
      desc: 'Orta şiddette manyetik uyarım. Evrensel enerjinin hücresel düzeyde entegrasyonu gerçekleşiyor. Işık beden aktivasyonu, DNA şablonunun güncellenmesi ve yüksek boyutlu frekanslara uyumlanmak için bu zaman dilimini niyet çalışmaları ve sessiz tefekkür ile değerlendirebilirsiniz.'
    };
  } else if (kp < 8) {
    return {
      label: 'Portal Geçişi (G3 Manyetik Aktivite)',
      desc: 'Güçlü bir manyetik aktivite dalgası. Aura alanınız yoğun kozmik ışık kodlarıyla yıkanıyor. Duygusal dalgalanmalar ve uykuya dalışta zorlanmalar, eski kalıpların salınımına işaret eder. Çakra dengeleme, kalp kapısını açma ve kristal şifa meditasyonları için zirve noktası.'
    };
  } else if (kp < 9) {
    return {
      label: 'Hücresel Dönüşüm (G4 Manyetik Aktivite)',
      desc: 'Şiddetli manyetik uyarım ve kozmik akış. Hücreleriniz ve DNA iplikçikleriniz yüksek güneş kodlarını soğuruyor. Bu yoğun enerji altında kendinizi zorlamadan sessizce uzanarak meditasyon yapabilir, aura temizliği ve uyanış niyetlerinize odaklanarak kozmik akışla bütünleşebilirsiniz.'
    };
  } else {
    return {
      label: 'Ekstrem Kozmik Portal (G5 Manyetik Aktivite)',
      desc: 'Zirve seviyede elektromanyetik uyanış ve ışık portalı! Kolektif bilinçte muazzam bir vites değişimi. Bu olağanüstü kozmik akışı sessizce oturup taç ve kalp çakralarınızdan tüm bedeninize akan beyaz ışığı imgeleyerek, derin frekans meditasyonları ve DNA aktivasyon niyetleriyle taçlandırın.'
    };
  }
}

export async function GET() {
  try {
    // Fetch from the combined observed + forecast endpoint
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', {
      next: { revalidate: 300 } // cache for 5 minutes (300 seconds) to get near real-time updates
    });
    if (!res.ok) {
      throw new Error(`NOAA API responded with status: ${res.status}`);
    }
    const list = await res.json();
    
    // Find index of the last observed reading
    const lastObservedIndex = list.map((item: any) => item.observed).lastIndexOf('observed');
    
    let past: any[] = [];
    let future: any[] = [];
    let currentKp = 0;
    let lastReadingTime = '';

    if (lastObservedIndex !== -1) {
      // Get the last 16 observed readings (past 48 hours)
      const startIdx = Math.max(0, lastObservedIndex - 15);
      past = list.slice(startIdx, lastObservedIndex + 1);
      
      // Get the next 8 predicted readings (future 24 hours)
      future = list.slice(lastObservedIndex + 1, lastObservedIndex + 9);
      
      const lastObserved = list[lastObservedIndex];
      currentKp = parseFloat(lastObserved.kp);
      lastReadingTime = lastObserved.time_tag;
    } else {
      // Fallback if no 'observed' flag is found (slice last 24)
      past = list.slice(-24);
      const lastItem = list[list.length - 1];
      currentKp = parseFloat(lastItem.kp);
      lastReadingTime = lastItem.time_tag;
    }

    // Combine history with a predicted flag
    const history = [
      ...past.map((item: any) => ({
        time: item.time_tag,
        kp: parseFloat(item.kp),
        predicted: false
      })),
      ...future.map((item: any) => ({
        time: item.time_tag,
        kp: parseFloat(item.kp),
        predicted: true
      }))
    ];

    const status = getStatusInfo(currentKp);

    return json({
      current_kp: currentKp,
      status_label: status.label,
      status_desc: status.desc,
      updated_at: lastReadingTime,
      history: history
    });
  } catch (error: any) {
    console.error('NOAA Kp API Error:', error);
    return errorJson('Kozmik hava durumu verileri yüklenirken bir hata oluştu.', 500);
  }
}
