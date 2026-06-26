"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Wind, BookOpen, Sparkles, Lock, MoonStar, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ExploreItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  requiresAuth: boolean;
  status: 'ACTIVE' | 'LOCKED';
  lockMessage?: string;
}

const exploreItems: ExploreItem[] = [
  {
    title: 'Meditasyon',
    description: 'Zihninizi dinlendirin ve içsel huzuru bulun.',
    icon: Moon,
    href: '/meditation',
    color: 'from-indigo-500 to-purple-500',
    requiresAuth: false,
    status: 'ACTIVE'
  },
  {
    title: 'Nefes Çalışması',
    description: 'Nefes teknikleriyle enerjinizi dengeleyin.',
    icon: Wind,
    href: '/breathwork',
    color: 'from-cyan-500 to-blue-500',
    requiresAuth: false,
    status: 'ACTIVE'
  },
  {
    title: 'Kadim Dersler',
    description: 'Geçmişin bilgeliğiyle geleceğinizi aydınlatın.',
    icon: BookOpen,
    href: '/kadim-dersler',
    color: 'from-amber-500 to-orange-500',
    requiresAuth: true,
    status: 'ACTIVE'
  },
  {
    title: 'Hastalıkların Duygusal Nedenleri',
    description: 'Hastalığınızın ardındaki duygusal nedeni sorgulayın.',
    icon: Moon,
    href: '/kadim-dersler/duygusal-hastaliklar',
    color: 'from-red-500 to-rose-500',
    requiresAuth: false,
    status: 'ACTIVE'
  },
  {
    title: 'Çakra',
    description: 'Anlık olarak çakra durumunuzu analiz edin.',
    icon: Sparkles,
    href: '/analysis/chakra',
    color: 'from-rose-500 to-pink-500',
    requiresAuth: true,
    status: 'ACTIVE'
  },
  {
    title: 'Kabalistik 4 Alem',
    description: 'Sefirot ağacındaki kadersel sıçrama noktalarınızı bulun.',
    icon: MoonStar,
    href: '/analysis/kabbalah',
    color: 'from-yellow-600 to-amber-400',
    requiresAuth: true,
    status: 'ACTIVE'
  }
];

export default function ExploreSection() {
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    if (item.status === 'LOCKED') {
      e.preventDefault();
      // If they click on a locked item that requires auth, we can route them to login
      if (item.requiresAuth && !isLoggedIn && item.lockMessage === 'Üyelik Gerektirir') {
        router.push('/auth/login');
      }
      return;
    }
    if (item.requiresAuth && !isLoggedIn) {
      e.preventDefault();
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              whileHover={item.status === 'ACTIVE' ? { y: -5, scale: 1.02 } : {}}
              className={`relative overflow-hidden group bg-mystic-surface border border-mystic-surface-light rounded-2xl p-6 h-full flex flex-col items-center text-center ${item.status === 'LOCKED' ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
            >
              {item.status === 'ACTIVE' && (
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              )}
              
              <div className="w-16 h-16 rounded-full bg-mystic-surface-light flex items-center justify-center mb-6 relative">
                <item.icon size={32} className="text-mystic-text" />
                {item.requiresAuth && !isLoggedIn && item.status !== 'LOCKED' && (
                  <div className="absolute -top-2 -right-2 bg-mystic-dark p-1 rounded-full border border-mystic-surface-light">
                    <Lock size={12} className="text-mystic-accent" />
                  </div>
                )}
                {item.status === 'LOCKED' && (
                  <div className="absolute -top-2 -right-2 bg-mystic-dark p-1 rounded-full border border-mystic-surface-light text-mystic-text-muted">
                    {item.lockMessage === 'Yapım Aşamasında' ? <Wrench size={12} /> : <Lock size={12} />}
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-mystic-text mb-3">{item.title}</h3>
              <p className="text-mystic-text-muted text-sm flex-grow">{item.description}</p>
              
              {item.status === 'LOCKED' && (
                <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-center text-xs font-bold text-mystic-text-muted/80">
                  {item.lockMessage === 'Yapım Aşamasında' ? <Wrench size={12} className="mr-2" /> : <Lock size={12} className="mr-2" />} {item.lockMessage}
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
