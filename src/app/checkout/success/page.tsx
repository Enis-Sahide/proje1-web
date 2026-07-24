"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Download, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { downloadKabbalahPDF } from '@/utils/kabbalahPdfGenerator';
import { downloadChartPDF } from '@/utils/pdfGenerator';
import { downloadHumanDesignPDF } from '@/utils/humanDesignPdfGenerator';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('İndirme belirteci eksik.');
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        const res = await fetch(`/api/astrology/guest-download?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'İndirme verileri yüklenemedi.');
        }

        setOrderData(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [token]);

  const handleDownload = async () => {
    if (!orderData || downloading) return;
    setDownloading(true);

    try {
      const { analysisType, birthData, result } = orderData;
      const { localDate, localTime, cityData } = birthData;
      
      const dateStr = `${localDate.split('-').reverse().join('.')} ${localTime}`;
      const locationStr = cityData.name;

      if (analysisType === 'kabbalah') {
        await downloadKabbalahPDF(
          result.charts,
          result.kabbalahAnalysis,
          result.interpretations,
          locationStr,
          dateStr
        );
      } else if (analysisType === 'human-design' || analysisType === 'human_design') {
        await downloadHumanDesignPDF(
          result.chartData,
          locationStr,
          dateStr,
          result.gatesData
        );
      } else {
        // Standard Astrology PDF
        downloadChartPDF(
          result.chartData,
          locationStr,
          dateStr
        );
      }
    } catch (err) {
      console.error('PDF download error:', err);
      alert('PDF indirilirken bir hata oluştu.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center">
        <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={32} />
        <p className="text-mystic-text-muted">Doğum Haritanız Kaplanıp Analiz Ediliyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Erişim Hatası</h2>
        <p className="text-red-400 text-sm mb-6">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-xl transition-all"
        >
          Ana Sayfaya Git
        </button>
      </div>
    );
  }

  const reportName = orderData.analysisType === 'kabbalah' ? 'Kabalistik 4 Alem Harita Raporu' : 'Doğum Haritası Raporu';

  return (
    <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(212,175,55,0.05)] flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
        <CheckCircle2 size={32} className="text-green-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">İşleminiz Başarılı!</h1>
      <p className="text-mystic-text-muted text-sm mb-6">
        Ödemeniz başarıyla tamamlandı. Hazırlanan raporunuz cihazınızda indirilmeye hazır!
      </p>

      {/* Info Box */}
      <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-3 mb-6">
        <div className="flex justify-between items-center text-xs">
          <span className="text-mystic-text-muted">Rapor Türü:</span>
          <span className="text-white font-semibold">{reportName}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-mystic-text-muted">Gönderilen E-Posta:</span>
          <span className="text-[#D4AF37] font-semibold">{orderData.email}</span>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center text-lg shadow-lg shadow-[#D4AF37]/20 mb-4"
      >
        {downloading ? (
          <><Loader2 className="animate-spin mr-2" /> PDF Oluşturuluyor...</>
        ) : (
          <><Download className="mr-2" /> Raporu PDF Olarak İndir</>
        )}
      </button>

      <div className="flex items-center gap-2 text-xs text-mystic-text-muted">
        <Mail size={12} className="text-[#D4AF37]" />
        <span>İndirme bağlantısı e-postanıza da gönderilmiştir.</span>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-6 relative font-sans">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6A0DAD] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={32} />
          <p className="text-mystic-text-muted">İndirme Sayfası Hazırlanıyor...</p>
        </div>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
