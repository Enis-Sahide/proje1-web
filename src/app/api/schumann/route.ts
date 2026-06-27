import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

function getStatusInfo(kp: number) {
  if (kp < 3) {
    return {
      label: 'Sakin',
      desc: 'Manyetik alan sakin. Zihinsel odaklanma, gevşeme, topraklanma ve meditasyon için oldukça dengeli ve huzurlu bir ortam.'
    };
  } else if (kp < 4) {
    return {
      label: 'Kararsız',
      desc: 'Hafif bir elektromanyetik kıpırdanma var. Enerji seviyelerinde dalgalanma ve hafif bir içsel huzursuzluk hissedilebilir.'
    };
  } else if (kp < 5) {
    return {
      label: 'Aktif',
      desc: 'Aktif bir manyetik alan. Hassas kişilerde rüyaların berraklaşması, sezgilerin güçlenmesi veya hafif uykusuzluk görülebilir.'
    };
  } else if (kp < 6) {
    return {
      label: 'G1 Fırtına (Küçük)',
      desc: 'Küçük çaplı jeomanyetik fırtına. Baş ağrısı, yorgunluk ve içsel gerilim yaşanması olasıdır. Doğada topraklanma tavsiye edilir.'
    };
  } else if (kp < 7) {
    return {
      label: 'G2 Fırtına (Orta)',
      desc: 'Orta şiddetli manyetik fırtına. Biyolojik sistemleriniz bu kozmik fırtınaya adapte olmaya çalışırken dinlenmeye özen gösterin.'
    };
  } else if (kp < 8) {
    return {
      label: 'G3 Fırtına (Güçlü)',
      desc: 'Güçlü jeomanyetik fırtına. Yoğun enerjisel uyarım, duygusal iniş çıkışlar, rüyalarda artış ve uykuya dalma zorluğu yaşanabilir.'
    };
  } else if (kp < 9) {
    return {
      label: 'G4 Fırtına (Ağır)',
      desc: 'Şiddetli manyetik fırtına. Küresel boyutta çok güçlü enerjisel uyarım mevcuttur. Derin nefes egzersizleri ve sakinlik önerilir.'
    };
  } else {
    return {
      label: 'G5 Fırtına (Ekstrem)',
      desc: 'Olağanüstü fırtına! Küresel elektromanyetik dengede ekstrem dalgalanma. Zihni dinginleştirmek ve içe dönmek en doğrusudur.'
    };
  }
}

export async function GET() {
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {
      next: { revalidate: 3600 } // cache for 1 hour (3600 seconds) since Kp index updates every 3 hours
    });
    if (!res.ok) {
      throw new Error(`NOAA API responded with status: ${res.status}`);
    }
    const list = await res.json();
    
    // Sort and clean history (last 24 measurements represents the last 72 hours in 3-hour blocks)
    const history = list.map((item: any) => ({
      time: item.time_tag,
      kp: parseFloat(item.Kp)
    })).slice(-24);

    const lastReading = list[list.length - 1];
    const currentKp = parseFloat(lastReading.Kp);
    const status = getStatusInfo(currentKp);

    return json({
      current_kp: currentKp,
      status_label: status.label,
      status_desc: status.desc,
      updated_at: lastReading.time_tag,
      history: history
    });
  } catch (error: any) {
    console.error('NOAA Kp API Error:', error);
    return errorJson('Kozmik hava durumu verileri yüklenirken bir hata oluştu.', 500);
  }
}
