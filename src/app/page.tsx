"use client";

import React, { useState } from 'react';
import HumanDesignBodygraph from '@/components/HumanDesignBodygraph';
import { Loader2 } from 'lucide-react';
import { HumanDesignChart } from '@/utils/HumanDesignEngine';

export default function Home() {
  const [date, setDate] = useState('1990-01-01');
  const [time, setTime] = useState('12:00');
  const [city, setCity] = useState('Istanbul');
  const [loading, setLoading] = useState(false);
  const [chart, setChart] = useState<HumanDesignChart | null>(null);
  const [error, setError] = useState('');

  const calculateChart = async () => {
    setLoading(true);
    setError('');
    setChart(null);
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      const res = await fetch('/api/human-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          lat: 41.0082, // Şimdilik varsayılan İstanbul
          lon: 28.9784,
          tz: 'Europe/Istanbul'
        })
      });

      if (!res.ok) throw new Error('Hesaplama hatası');
      const data = await res.json();
      setChart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Arka plan efekti */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover opacity-20 blur-xl -z-10" />
      
      <div className="max-w-5xl w-full z-10">
        <h1 className="text-4xl font-bold text-sky-400 text-center mb-2">İnsan Tasarımı Haritası</h1>
        <p className="text-slate-400 text-center mb-10 italic">Gerçek Astronomik Ephemeris Motoru (Web API)</p>

        {!chart ? (
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 shadow-2xl max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-6">Doğum Bilgilerinizi Girin</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-sky-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Saat</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-sky-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Şehir</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-sky-500" placeholder="Örn: Istanbul" />
              </div>

              {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

              <button 
                onClick={calculateChart}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3 rounded-lg mt-6 transition-all flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : 'Haritayı Hesapla (API)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button onClick={() => setChart(null)} className="text-sky-400 hover:text-sky-300 mb-6 flex items-center font-medium">
              ← Yeni Hesaplama
            </button>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-3/4">
                {/* SVG Grafiği buraya gelecek */}
                <HumanDesignBodygraph chart={chart} />
              </div>
              
              <div className="w-full lg:w-1/4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-sky-400 mb-4 border-b border-slate-700 pb-2">Analiz Özeti</h3>
                <div className="space-y-3">
                  <div><span className="text-slate-400 text-sm block">Profil:</span><span className="font-semibold">{chart.profile}</span></div>
                  <div><span className="text-slate-400 text-sm block">Tür:</span><span className="font-semibold text-rose-400">{chart.type}</span></div>
                  <div><span className="text-slate-400 text-sm block">Strateji:</span><span className="font-semibold">{chart.strategy}</span></div>
                  <div><span className="text-slate-400 text-sm block">İç Otorite:</span><span className="font-semibold">{chart.authority}</span></div>
                  <div><span className="text-slate-400 text-sm block">İmza:</span><span className="font-semibold">{chart.signature}</span></div>
                  <div><span className="text-slate-400 text-sm block">Benlik Olmayan Tema:</span><span className="font-semibold">{chart.notSelfTheme}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
