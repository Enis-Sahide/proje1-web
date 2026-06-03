"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, DollarSign, Store, CheckCircle, XCircle, ArrowLeft, Star } from 'lucide-react';
import { VENDORS } from '@/data/marketplaceData';

export default function AdminDashboard() {
  const router = useRouter();

  // Mock global stats
  const totalPlatformSales = 45000;
  const platformCommission = totalPlatformSales * 0.10; // 10%
  const activeStores = VENDORS.length;

  const [vendors, setVendors] = useState(VENDORS.map(v => ({...v, status: 'approved'})));

  const handleToggleStatus = (id: string) => {
    setVendors(vendors.map(v => {
      if (v.id === id) {
        return { ...v, status: v.status === 'approved' ? 'banned' : 'approved' };
      }
      return v;
    }));
  };

  return (
    <div className="min-h-screen bg-mystic-dark pb-24">
      {/* Header */}
      <header className="bg-black/50 border-b border-mystic-primary/20 p-6 pt-28 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-3 text-mystic-primary">
              <Shield size={32} />
              <div>
                <h1 className="text-xl font-bold text-white">Sistem Yöneticisi</h1>
                <p className="text-xs">Pazaryeri Genel Yönetim Paneli</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        
        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium">Toplam Platform Satışı</h3>
              <div className="bg-white/10 p-2 rounded-lg text-white"><DollarSign size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{totalPlatformSales} ₺</p>
            <p className="text-xs text-mystic-text-muted mt-2">Tüm mağazaların toplam cirosu</p>
          </div>

          <div className="bg-mystic-primary/10 border border-mystic-primary/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mystic-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-mystic-primary font-bold">Platform Geliri (%10 Komisyon)</h3>
              <div className="bg-mystic-primary p-2 rounded-lg text-black"><Shield size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white relative z-10">{platformCommission} ₺</p>
            <p className="text-xs text-mystic-primary/80 mt-2 relative z-10">Sizin net kazancınız</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium">Aktif Mağazalar</h3>
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Store size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{activeStores}</p>
          </div>
        </div>

        {/* Vendors Management */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-mystic-primary" /> Mağaza Yönetimi
          </h2>
          
          <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-mystic-text-muted text-sm border-b border-white/5">
                <tr>
                  <th className="p-4 font-medium">Mağaza Adı</th>
                  <th className="p-4 font-medium">Puan</th>
                  <th className="p-4 font-medium">Durum</th>
                  <th className="p-4 font-medium text-right">İşlem (Kapat/Aç)</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm divide-y divide-white/5">
                {vendors.map(v => (
                  <tr key={v.id} className={`transition-colors ${v.status === 'banned' ? 'opacity-50 bg-red-900/10' : 'hover:bg-white/5'}`}>
                    <td className="p-4 flex items-center gap-3">
                      <img src={v.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div>
                        <span className="font-bold block">{v.name}</span>
                        <span className="text-xs text-mystic-text-muted">ID: {v.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center text-yellow-500 font-bold"><Star size={14} className="mr-1" fill="currentColor"/> {v.rating}</span>
                    </td>
                    <td className="p-4">
                      {v.status === 'approved' ? (
                        <span className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded-full w-max text-xs"><CheckCircle size={14} className="mr-1"/> Aktif</span>
                      ) : (
                        <span className="flex items-center text-red-400 bg-red-400/10 px-2 py-1 rounded-full w-max text-xs"><XCircle size={14} className="mr-1"/> Engellendi</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(v.id)}
                        className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                          v.status === 'approved' 
                          ? 'border-red-500/50 text-red-400 hover:bg-red-500/20' 
                          : 'border-green-500/50 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {v.status === 'approved' ? 'Mağazayı Kapat' : 'Geri Aç'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
