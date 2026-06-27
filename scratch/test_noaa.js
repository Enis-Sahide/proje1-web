const https = require('https');

function getStatusInfo(kp) {
  if (kp < 3) {
    return {
      label: 'Sakin',
      desc: 'Manyetik alan sakin. Zihinsel odaklanma, gevşeme ve meditasyon için oldukça dengeli ve huzurlu bir ortam.'
    };
  } else if (kp < 4) {
    return {
      label: 'Kararsız',
      desc: 'Hafif bir elektromanyetik kıpırdanma var. Enerji seviyelerinde dalgalanma ve hafif bir huzursuzluk hissedilebilir.'
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

https.get('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const list = JSON.parse(data);
      // Filter out headers or clean data. The first item in services.swpc.noaa.gov/products/noaa-planetary-k-index.json is NOT a header string if it's formatted as standard JSON list.
      // Wait, let's see. In our test, res is parsed as JSON successfully. The first item was:
      // { time_tag: '2026-06-20T00:00:00', Kp: 2.67, a_running: 12, station_count: 8 }
      // So all elements are data rows!
      const history = list.map(item => ({
        time: item.time_tag,
        kp: parseFloat(item.Kp)
      })).slice(-24); // Get the last 24 records (last 72 hours since they are 3-hour blocks)
      
      const lastReading = list[list.length - 1];
      const currentKp = parseFloat(lastReading.Kp);
      const status = getStatusInfo(currentKp);
      
      const responseData = {
        current_kp: currentKp,
        status_label: status.label,
        status_desc: status.desc,
        updated_at: lastReading.time_tag,
        history: history
      };
      
      console.log("Formed response structure:", JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error("Error:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
