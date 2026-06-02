"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Wind, BookOpen, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const exploreItems = [
  {
    title: 'Meditasyon',
    description: 'Zihninizi dinlendirin ve içsel huzuru bulun.',
    icon: Moon,
    href: '/meditation',
    color: 'from-indigo-500 to-purple-500',
    requiresAuth: false
  },
  {
    title: 'Nefes Çalışması',
    description: 'Nefes teknikleriyle enerjinizi dengeleyin.',
    icon: Wind,
    href: '/breathwork',
    color: 'from-cyan-500 to-blue-500',
    requiresAuth: false
  },
  {
    title: 'Kadim Dersler',
    description: 'Geçmişin bilgeliğiyle geleceğinizi aydınlatın.',
    icon: BookOpen,
    href: '/kadim-dersler',
    color: 'from-amber-500 to-orange-500',
    requiresAuth: false
  },
  {
    title: 'Çakra & Aura Analizi',
    description: 'Enerji merkezlerinizi keşfedin. (Üyelik Gerektirir)',
    icon: Sparkles,
    href: '/dashboard/tests',
    color: 'from-rose-500 to-pink-500',
    requiresAuth: true
  }
];

export default function ExploreSection() {
  const router = useRouter();
  const isLoggedIn = false; // TODO: Supabase auth state

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    if (item.requiresAuth && !isLoggedIn) {
      e.preventDefault();
      // Burada modal veya toast da gösterebiliriz
      alert("Bu sınava/analize girmek için hesap oluşturmanız veya giriş yapmanız gerekmektedir.");
      router.push('/auth/login');
    }
  };

  return (
    <section className="py-20 px-4 w-full max-w-7xl mx-auto z-10 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mystic-text to-mystic-accent mb-4">
          Ruhsal Yolculuğunuzu Keşfedin
        </h2>
        <p className="text-mystic-text-muted max-w-2xl mx-auto text-lg">
          Kendi potansiyelinizi ortaya çıkarmak ve evrensel uyumu yakalamak için sizin için hazırladığımız araçları kullanın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {exploreItems.map((item, index) => (
          <Link 
            key={item.title} 
            href={item.href}
            onClick={(e) => handleItemClick(e, item)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative overflow-hidden group bg-mystic-surface border border-mystic-surface-light rounded-2xl p-6 h-full flex flex-col items-center text-center cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="w-16 h-16 rounded-full bg-mystic-surface-light flex items-center justify-center mb-6 relative">
                <item.icon size={32} className="text-mystic-text" />
                {item.requiresAuth && !isLoggedIn && (
                  <div className="absolute -top-2 -right-2 bg-mystic-dark p-1 rounded-full border border-mystic-surface-light">
                    <Lock size={12} className="text-mystic-accent" />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-mystic-text mb-3">{item.title}</h3>
              <p className="text-mystic-text-muted text-sm">{item.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
