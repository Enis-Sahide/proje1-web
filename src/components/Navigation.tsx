"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, User, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // TODO: Supabase auth state'i buraya entegre edilecek
  const isLoggedIn = false; 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Keşfet', href: '/explore' },
    { name: 'Meditasyon', href: '/meditation' },
    { name: 'Nefes', href: '/breathwork' },
    { name: 'Kadim Dersler', href: '/kadim-dersler' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-mystic-dark/90 backdrop-blur-md border-b border-mystic-surface-light shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-mystic-primary via-mystic-accent to-mystic-primary shadow-[0_0_8px_rgba(212,175,55,0.9),0_0_16px_rgba(212,175,55,0.5),0_0_32px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_12px_rgba(212,175,55,1),0_0_24px_rgba(212,175,55,0.7),0_0_40px_rgba(212,175,55,0.3)] transition-all duration-500">
            <Image src="/logo.png" alt="7Layers Logo" width={32} height={32} className="rounded-full bg-mystic-dark block" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mystic-primary to-mystic-accent">
            7Layers
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-mystic-accent ${
                pathname === link.href ? 'text-mystic-accent border-b border-mystic-accent pb-1' : 'text-mystic-text-muted'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth / Profile (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-2 text-mystic-text hover:text-mystic-primary transition-colors">
              <User size={20} />
              <span>Profil</span>
            </Link>
          ) : (
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-mystic-primary text-mystic-primary hover:bg-mystic-primary hover:text-white transition-all"
            >
              <LogIn size={18} />
              <span>Giriş Yap</span>
            </Link>
          )}
          <ThemeToggle />
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
            {navLinks.map((link) => (
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
            ))}
            
            <div className="mt-6">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-mystic-surface-light rounded-lg text-mystic-text"
                >
                  <User size={20} />
                  <span>Profilim</span>
                </Link>
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
