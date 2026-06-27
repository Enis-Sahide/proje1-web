import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
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
    return json(data);
  } catch (error: any) {
    console.error('Schumann API Error:', error);
    return errorJson('Schumann rezonansı verileri yüklenirken bir hata oluştu.', 500);
  }
}
