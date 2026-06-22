"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingBag, Award, MapPin, Loader2 } from 'lucide-react';
import { useMarketplace } from '@/lib/useContent';

export default function StoreProfilePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { vendors: VENDORS, products: PRODUCTS, loading } = useMarketplace();
  const vendor = VENDORS.find(v => v.id === storeId);
  const vendorProducts = PRODUCTS.filter(p => p.vendorId === storeId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mystic-dark">
        <Loader2 className="animate-spin text-mystic-primary" size={36} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mystic-dark">
        <p className="text-white">Mağaza bulunamadı.</p>
        <button onClick={() => router.push('/explore')} className="ml-4 text-mystic-primary underline">Keşfet'e Dön</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Background */}
            
      {/* Header Banner */}
      <div className="h-64 relative">
        <img src={vendor.avatar} alt="Banner" className="w-full h-full object-cover opacity-40 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark to-transparent" />
        <button onClick={() => router.push('/explore')} className="absolute top-8 left-6 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/10 z-40">
          <ArrowLeft size={24} className="text-white" />
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
        
        {/* Store Info Profile */}
        <div className="bg-black/60 backdrop-blur-md border border-mystic-primary/30 p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl">
          <div className="w-32 h-32 rounded-full border-4 border-mystic-dark overflow-hidden shrink-0 shadow-xl">
            <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              {vendor.name} {vendor.isFeatured && <Award className="text-yellow-500" size={24} />}
            </h1>
            <p className="text-mystic-text-muted mb-4">{vendor.description}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-mystic-text">
              <div className="flex items-center bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
                <span className="font-bold text-yellow-500">{vendor.rating}</span>
                <span className="text-yellow-500/60 ml-1">Mağaza Puanı</span>
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-1 text-mystic-text-muted" /> Onaylı Satıcı
              </div>
              <div className="flex items-center">
                <ShoppingBag size={14} className="mr-1 text-mystic-text-muted" /> {vendorProducts.length} Ürün
              </div>
            </div>
          </div>
        </div>

        {/* Store Products */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Mağazadaki Ürünler</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorProducts.map(product => (
              <Link href={`/explore/product/${product.id}`} key={product.id} className="bg-black/30 border border-white/10 hover:border-mystic-primary/40 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-white mb-2">{product.name}</h3>
                  <p className="text-sm text-mystic-text-muted line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-mystic-primary">{product.price} ₺</span>
                    <button className="bg-mystic-primary/20 hover:bg-mystic-primary text-mystic-primary hover:text-black transition-colors p-2 rounded-full border border-mystic-primary/50">
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {vendorProducts.length === 0 && (
             <div className="text-center py-10 bg-black/20 rounded-2xl border border-white/5">
               <p className="text-mystic-text-muted">Bu mağazada henüz ürün bulunmuyor.</p>
             </div>
          )}
        </div>

      </main>
    </div>
  );
}
