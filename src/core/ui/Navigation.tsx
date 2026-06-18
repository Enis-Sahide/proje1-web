"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, User, LogIn, ShoppingCart, Store, Shield, Lock, Wrench, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = role === 'admin';

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
    { name: 'Dersler', href: '/kadim-dersler', requiresAuth: true, isUnderConstruction: true },
    { name: 'VIP Seviyeler', href: '/membership', isUnderConstruction: true },
  ];

  const navLinks = isAdmin 
    ? [
        { name: 'Admin Paneli', href: '/admin/dashboard' },
        ...baseLinks
      ]
    : baseLinks;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-mystic-dark/95 md:backdrop-blur-md border-b border-mystic-surface-light shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-3 group shrink-0 mr-6 md:mr-8 lg:mr-12">
          <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-mystic-primary via-mystic-accent to-mystic-primary shadow-[0_0_8px_rgba(212,175,55,0.9),0_0_16px_rgba(212,175,55,0.5),0_0_32px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_12px_rgba(212,175,55,1),0_0_24px_rgba(212,175,55,0.7),0_0_40px_rgba(212,175,55,0.3)] transition-all duration-500">
            <Image src="/logo.png" alt="7Layers Logo" width={32} height={32} className="rounded-full bg-mystic-dark block" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mystic-primary to-mystic-accent whitespace-nowrap">
            7Layers
          </span>
        </Link>

        {/* Right side container */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-12 ml-auto">
          {/* Desktop Nav */}
          <nav className="flex items-center gap-2 lg:gap-4 xl:gap-6">
            {navLinks.map((link) => {
              const isLocked = link.requiresAuth && !isLoggedIn;
              const isConstruction = link.isUnderConstruction && !isAdmin;
              
              if (isConstruction) {
                return (
                  <div 
                    key={link.name} 
                    className={`text-sm uppercase tracking-wider font-medium text-mystic-text-muted/40 flex items-center gap-1.5 cursor-not-allowed whitespace-nowrap`}
                    title="Yapım Aşamasında"
                  >
                    {link.name}
                    <Wrench size={12} className="opacity-70" />
                  </div>
                );
              }

              return isLocked ? (
                <Link 
                  key={link.name} 
                  href="/auth/login"
                  className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-mystic-accent text-mystic-text-muted/50 flex items-center gap-1.5 whitespace-nowrap`}
                  title="Üyelik Gerektirir"
                >
                  {link.name}
                  <Lock size={12} className="opacity-70" />
                </Link>
              ) : (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-mystic-accent whitespace-nowrap ${
                    pathname === link.href ? 'text-mystic-accent border-b border-mystic-accent pb-1' : 'text-mystic-text-muted'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Profile (Desktop) */}
          <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/profile"
                    className="text-mystic-text-muted hover:text-mystic-accent text-sm flex items-center gap-1.5 transition-colors cursor-pointer group"
                    title={user.user_metadata?.full_name || user.email}
                  >
                    <User size={14} className="opacity-70 group-hover:text-mystic-accent shrink-0" />
                    <span className="hidden xl:inline truncate max-w-[120px]">{user.user_metadata?.full_name || user.email}</span>
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-colors text-sm font-medium"
                  >
                    <LogOut size={16} /> Çıkış Yap
                  </button>
                </div>
              ) : (
              <Link 
                href="/auth/login" 
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-mystic-primary text-mystic-primary hover:bg-mystic-primary hover:text-white transition-all"
              >
                <LogIn size={18} />
                <span>Giriş Yap</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-mystic-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-mystic-surface border-b border-mystic-surface-light md:hidden flex flex-col px-4 py-6 shadow-2xl"
          >
            {navLinks.map((link) => {
              const isLocked = link.requiresAuth && !isLoggedIn;
              const isConstruction = link.isUnderConstruction && !isAdmin;

              if (isConstruction) {
                return (
                  <div 
                    key={link.name} 
                    className="text-lg py-3 border-b border-mystic-dark/50 text-mystic-text-muted/40 flex items-center justify-between cursor-not-allowed"
                    title="Yapım Aşamasında"
                  >
                    <span>{link.name}</span>
                    <Wrench size={16} className="opacity-70" />
                  </div>
                );
              }

              return isLocked ? (
                <Link 
                  key={link.name} 
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg py-3 border-b border-mystic-dark/50 text-mystic-text-muted/60 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <Lock size={16} className="opacity-70" />
                </Link>
              ) : (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg py-3 border-b border-mystic-dark/50 ${
                    pathname === link.href ? 'text-mystic-accent' : 'text-mystic-text'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="mt-6">
              {isLoggedIn ? (
                  <div className="pt-4 border-t border-mystic-surface-light flex flex-col gap-4">
                    <Link 
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-mystic-text-muted hover:text-mystic-accent text-sm text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <User size={16} />
                      <span>{user.user_metadata?.full_name || user.email}</span>
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
                  <LogIn size={20} />
                  <span>Giriş Yap / Üye Ol</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
