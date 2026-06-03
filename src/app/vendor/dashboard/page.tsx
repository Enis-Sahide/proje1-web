"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, DollarSign, PlusCircle, Bell, ArrowLeft } from 'lucide-react';
import { VENDORS, PRODUCTS } from '@/data/marketplaceData';

export default function VendorDashboard() {
  const router = useRouter();
  
  // Mock login as the first vendor
  const vendor = VENDORS[0]; 
  const vendorProducts = PRODUCTS.filter(p => p.vendorId === vendor.id);

  const mockSales = 24;
  const mockRevenue = 8450;
  const commission = mockRevenue * 0.10;
  const netEarnings = mockRevenue - commission;

  return (
    <div className="min-h-screen bg-mystic-dark pb-24">
      {/* Sidebar / Header (Simplified for this mock) */}
      <header className="bg-black/50 border-b border-mystic-primary/20 p-6 pt-28 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-3">
              <img src={vendor.avatar} alt="Logo" className="w-10 h-10 rounded-full border border-mystic-primary" />
              <div>
                <h1 className="text-lg font-bold text-white">{vendor.name}</h1>
                <p className="text-xs text-mystic-primary">Satıcı Yönetim Paneli</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-mystic-text-muted hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="bg-mystic-primary text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#D4AF37] transition-colors">
              <PlusCircle size={16} /> Yeni Ürün
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium">Toplam Satış</h3>
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><TrendingUp size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{mockSales}</p>
            <p className="text-xs text-green-400 mt-2">+12% geçen aya göre</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium">Brüt Ciro</h3>
              <div className="bg-mystic-primary/20 p-2 rounded-lg text-mystic-primary"><DollarSign size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white">{mockRevenue} ₺</p>
          </div>

          <div className="bg-black/40 border border-red-500/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-400/80 font-medium">Kesilen Komisyon (%10)</h3>
              <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><DollarSign size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-red-400">-{commission} ₺</p>
            <p className="text-xs text-red-400/60 mt-2">Platform Kesintisi</p>
          </div>

          <div className="bg-mystic-primary/10 border border-mystic-primary/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mystic-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-mystic-primary font-bold">Net Kazanç (Ödenecek)</h3>
              <div className="bg-mystic-primary p-2 rounded-lg text-black"><DollarSign size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-white relative z-10">{netEarnings} ₺</p>
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Package className="text-mystic-primary" /> Ürünlerim ({vendorProducts.length})
          </h2>
          
          <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-mystic-text-muted text-sm border-b border-white/5">
                <tr>
                  <th className="p-4 font-medium">Ürün</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Fiyat</th>
                  <th className="p-4 font-medium">Stok</th>
                  <th className="p-4 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm divide-y divide-white/5">
                {vendorProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                      <span className="font-bold">{p.name}</span>
                    </td>
                    <td className="p-4 text-mystic-text-muted">{p.categoryId}</td>
                    <td className="p-4 font-bold text-mystic-primary">{p.price} ₺</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {p.stock} adet
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 mr-3">Düzenle</button>
                      <button className="text-red-400 hover:text-red-300">Sil</button>
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
