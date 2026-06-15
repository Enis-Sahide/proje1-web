"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingCart, Info, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { PRODUCTS, VENDORS } from '@/data/marketplaceData';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const product = PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mystic-dark">
        <p className="text-white">Ürün bulunamadı.</p>
        <button onClick={() => router.push('/explore')} className="ml-4 text-mystic-primary underline">Keşfet'e Dön</button>
      </div>
    );
  }

  const vendor = VENDORS.find(v => v.id === product.vendorId);

  const handleAddToCart = () => {
    // Mock add to cart
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Background */}
            
      {/* Header */}
      <header className="pt-24 pb-6 px-6 border-b border-white/5 bg-mystic-dark/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center">
          <button onClick={() => router.back()} className="mr-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors border border-white/10">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white truncate">Ürün Detayı</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
          
          {/* Product Image */}
          <div className="md:w-1/2 h-96 md:h-auto relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 md:from-black/80 to-transparent" />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/explore/store/${vendor?.id}`} className="bg-mystic-primary/20 border border-mystic-primary/30 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-mystic-primary/30 transition-colors">
                <img src={vendor?.avatar} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-bold text-mystic-primary">{vendor?.name}</span>
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
            <p className="text-mystic-text-muted text-lg leading-relaxed mb-8 flex-1">{product.description}</p>
            
            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="block text-sm text-mystic-text-muted mb-1">Fiyat</span>
                  <span className="text-4xl font-bold text-white">{product.price} <span className="text-2xl text-mystic-primary">₺</span></span>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-mystic-text-muted mb-1">Stok Durumu</span>
                  {product.stock > 0 ? (
                    <span className="text-green-400 font-medium">Stokta Var ({product.stock})</span>
                  ) : (
                    <span className="text-red-400 font-medium">Tükendi</span>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAdded}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                    isAdded ? 'bg-green-500 text-white' : 
                    product.stock === 0 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 
                    'bg-mystic-primary text-black hover:bg-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  }`}
                >
                  {isAdded ? (
                    <><CheckCircle2 size={24} className="mr-2" /> Sepete Eklendi</>
                  ) : (
                    <><ShoppingCart size={24} className="mr-2" /> Sepete Ekle</>
                  )}
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-200 text-sm">
                <Info size={20} className="shrink-0 mt-0.5" />
                <p>Bu platformda güvendesiniz. Satın aldığınız ürünler satıcı tarafından doğrudan adresinize gönderilir.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
