"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, User, LogIn, ShoppingCart, Store, Shield, Lock, Wrench, LogOut, Home, Compass, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const ROLE_SHORT_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  apprentice: 'Çırak',
  journeyman: 'Kalfa',
  master: 'Usta',
  admin: 'Admin',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  free: 'bg-white/5 border-white/10 text-mystic-text-muted',
  apprentice: 'bg-amber-500/10 border-amber-500/30 text-amber-400 border-amber-500/20',
  journeyman: 'bg-blue-500/10 border-blue-500/30 text-blue-400 border-blue-500/20',
  master: 'bg-mystic-primary/10 border-mystic-primary/30 text-mystic-primary border-mystic-primary/20',
  admin: 'bg-red-500/10 border-red-500/30 text-red-400 border-red-500/20',
};

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = role === 'admin';

  const getDisplayName = () => {
    if (!user) return '';
    const fullName = user.fullName || user.user_metadata?.full_name;
    if (fullName) {
      return fullName.trim().split(/\s+/)[0];
    }
    return user.email.split('@')[0];
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Frekans Odası', href: '/meditation' },
    { name: 'Nefes', href: '/breathwork' },
    { name: 'Analiz', href: '/analysis' },
    { name: 'Keşfet', href: '/explore', isUnderConstruction: true },
    { name: 'Dersler', href: '/kadim-dersler', requiresAuth: true },
    { name: 'Sınavlar', href: '/tests', requiresAuth: true },
    { name: 'VIP Seviyeler', href: '/membership', isUnderConstruction: true },
  ];

  const navLinks = isAdmin 
    ? [
        { name: 'Admin Paneli', href: '/admin/dashboard' },
        { name: 'Kadim Uygulamalar', href: '/vip-teknolojiler' },
        ...baseLinks
      ]
    : baseLinks;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? `bg-mystic-dark/95 ${isAdmin ? 'xl:backdrop-blur-md' : 'lg:backdrop-blur-md'} border-b border-mystic-surface-light shadow-lg py-3` : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-3 group shrink-0 mr-2 lg:mr-4 xl:mr-8">
          <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-mystic-primary via-mystic-accent to-mystic-primary shadow-[0_0_8px_rgba(212,175,55,0.9),0_0_16px_rgba(212,175,55,0.5),0_0_32px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_12px_rgba(212,175,55,1),0_0_24px_rgba(212,175,55,0.7),0_0_40px_rgba(212,175,55,0.3)] transition-all duration-500">
            <Image src="/logo.png" alt="7Layers Logo" width={32} height={32} className="rounded-full bg-mystic-dark block" />
          </div>
          <span className="text-xl xl:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mystic-primary to-mystic-accent whitespace-nowrap">
            7LAYERS
          </span>
        </Link>

        {/* Mobile Profile / Auth (Mobile Viewports) */}
        <div className={`items-center gap-2 ml-auto ${
          isAdmin ? 'flex xl:hidden' : 'flex lg:hidden'
        }`}>
          {isLoggedIn ? (
            <Link 
              href="/profile"
              className="flex items-center gap-2 text-mystic-text-muted hover:text-mystic-accent transition-colors"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="text-[11px] font-semibold text-white truncate max-w-[70px] mb-0.5">{getDisplayName()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest scale-90 origin-right ${ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.free}`}>
                  {ROLE_SHORT_LABELS[role] || 'Üye'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mystic-primary shadow-inner shrink-0">
                <User size={14} />
              </div>
            </Link>
          ) : (
            <Link 
              href="/auth/login" 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-mystic-primary text-mystic-primary hover:bg-mystic-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
            >
              <LogIn size={11} />
              <span>Giriş</span>
            </Link>
          )}
        </div>

        {/* Right side container */}
        <div className={`items-center gap-2 xl:gap-3 2xl:gap-6 ml-auto ${
          isAdmin ? 'hidden xl:flex' : 'hidden lg:flex'
        }`}>
          {/* Desktop Nav */}
          <nav className="flex items-center gap-1 xl:gap-1.5 2xl:gap-3">
            {navLinks.map((link) => {
              const isLocked = link.requiresAuth && !isLoggedIn;
              const isConstruction = link.isUnderConstruction && !isAdmin;
              
              if (isConstruction) {
                return (
                  <div 
                    key={link.name} 
                    className={`text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-wider font-medium text-mystic-text-muted/40 flex items-center gap-0.5 cursor-not-allowed whitespace-nowrap`}
                    title="Yapım Aşamasında"
                  >
                    {link.name}
                    <Wrench size={9} className="opacity-70" />
                  </div>
                );
              }

              return isLocked ? (
                <Link 
                  key={link.name} 
                  href="/auth/login"
                  className={`text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-wider font-medium transition-colors hover:text-mystic-accent text-mystic-text-muted/50 flex items-center gap-0.5 whitespace-nowrap`}
                  title="Üyelik Gerektirir"
                >
                  {link.name}
                  <Lock size={9} className="opacity-70" />
                </Link>
              ) : (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-wider font-medium transition-colors hover:text-mystic-accent whitespace-nowrap ${
                    pathname === link.href ? 'text-mystic-accent border-b border-mystic-accent pb-1' : 'text-mystic-text-muted'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Profile (Desktop) */}
          <div className="flex items-center gap-1.5 xl:gap-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-1.5 xl:gap-2">
                  <Link 
                    href="/profile"
                    className="text-mystic-text-muted hover:text-mystic-accent text-[11px] xl:text-xs flex items-center gap-1 transition-colors cursor-pointer group shrink-0"
                    title={user.user_metadata?.full_name || user.email}
                  >
                    <User size={12} className="opacity-70 group-hover:text-mystic-accent shrink-0" />
                    <span className="hidden xl:inline truncate max-w-[80px] 2xl:max-w-[120px]">{getDisplayName()}</span>
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-full border border-white/10 transition-colors text-[10px] xl:text-xs font-medium whitespace-nowrap"
                  >
                    <LogOut size={13} /> Çıkış Yap
                  </button>
                </div>
              ) : (
              <Link 
                href="/auth/login" 
                className="flex items-center gap-2 px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border border-mystic-primary text-mystic-primary hover:bg-mystic-primary hover:text-white transition-all text-[10px] xl:text-xs font-medium"
              >
                <LogIn size={14} />
                <span>Giriş Yap</span>
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (Footer Bar) */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-mystic-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl py-2 px-3 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.05)] z-50 justify-between items-center ${
        isAdmin ? 'flex xl:hidden' : 'flex lg:hidden'
      }`}>
        <Link 
          href="/" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === '/' ? 'text-mystic-accent' : 'text-mystic-text-muted hover:text-white'
          }`}
        >
          <Home size={18} />
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Ana Sayfa</span>
        </Link>
        
        <Link 
          href="/meditation" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === '/meditation' ? 'text-mystic-accent' : 'text-mystic-text-muted hover:text-white'
          }`}
        >
          <Sparkles size={18} />
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Frekans</span>
        </Link>
        
        <Link 
          href="/breathwork" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === '/breathwork' ? 'text-mystic-accent' : 'text-mystic-text-muted hover:text-white'
          }`}
        >
          <Activity size={18} />
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Nefes</span>
        </Link>
        
        <Link 
          href="/analysis" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            pathname === '/analysis' ? 'text-mystic-accent' : 'text-mystic-text-muted hover:text-white'
          }`}
        >
          <Compass size={18} />
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Analiz</span>
        </Link>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            mobileMenuOpen ? 'text-mystic-accent' : 'text-mystic-text-muted hover:text-white'
          }`}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Menü</span>
        </button>
      </div>

      {/* Mobile Nav Slide-Up Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${
                isAdmin ? 'xl:hidden' : 'lg:hidden'
              }`}
            />
            
            {/* Drawer Container */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 w-full bg-mystic-surface border-t border-mystic-surface-light rounded-t-[2.5rem] flex flex-col px-6 pt-6 pb-28 shadow-2xl z-40 max-h-[80vh] overflow-y-auto ${
                isAdmin ? 'xl:hidden' : 'lg:hidden'
              }`}
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <span className="text-sm font-bold text-mystic-primary uppercase tracking-wider">Hızlı Navigasyon</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto">
                {navLinks.map((link) => {
                  const isLocked = link.requiresAuth && !isLoggedIn;
                  const isConstruction = link.isUnderConstruction && !isAdmin;

                  if (isConstruction) {
                    return (
                      <div 
                        key={link.name} 
                        className="text-base py-3 border-b border-mystic-dark/30 text-mystic-text-muted/40 flex items-center justify-between cursor-not-allowed"
                        title="Yapım Aşamasında"
                      >
                        <span>{link.name}</span>
                        <Wrench size={14} className="opacity-70" />
                      </div>
                    );
                  }

                  return isLocked ? (
                    <Link 
                      key={link.name} 
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base py-3 border-b border-mystic-dark/30 text-mystic-text-muted/60 flex items-center justify-between"
                    >
                      <span>{link.name}</span>
                      <Lock size={14} className="opacity-70" />
                    </Link>
                  ) : (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base py-3 border-b border-mystic-dark/30 ${
                        pathname === link.href ? 'text-mystic-accent font-semibold' : 'text-mystic-text'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-6 shrink-0">
                {isLoggedIn ? (
                  <div className="pt-4 border-t border-mystic-surface-light flex flex-col gap-4">
                    <Link 
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-mystic-text-muted hover:text-mystic-accent text-sm text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <User size={16} />
                      <span>{getDisplayName()}</span>
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 bg-white/5 px-6 py-3 rounded-xl border border-white/10 text-mystic-text-muted w-full"
                    >
                      <LogOut size={18} /> Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-mystic-primary rounded-lg text-white font-medium"
                  >
                    <LogIn size={18} />
                    <span>Giriş Yap / Üye Ol</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
