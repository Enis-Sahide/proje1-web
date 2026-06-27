import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

async function translateToTurkish(text: string): Promise<string> {
  if (!text) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    return json[0].map((item: any) => item[0]).join('');
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
}

export async function GET() {
  try {
    const res = await fetch('https://resonanceone.app/api/now', {
      next: { revalidate: 300 } // cache for 5 minutes (300 seconds)
    });
    if (!res.ok) {
      throw new Error(`ResonanceOne API responded with status: ${res.status}`);
    }
    const data = await res.json();

    // Translate the summary and tip to Turkish
    if (data.summary) {
      data.summary = await translateToTurkish(data.summary);
    }
    if (data.tip) {
      data.tip = await translateToTurkish(data.tip);
    }

    return json(data);
  } catch (error: any) {
    console.error('Schumann API Error:', error);
    return errorJson('Schumann rezonansı verileri yüklenirken bir hata oluştu.', 500);
  }
}
