'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { getPlanetaryHours, getPlanetInfo } from '@/utils/PlanetaryHours';
import Link from 'next/link';

export default function PlanetaryHourWidget() {
  const [currentHour, setCurrentHour] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 41.0082, lon: 28.9784, name: 'İstanbul' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last_planet_hours_location');
      if (saved) {
        try {
          setLocation(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const updateHour = () => {
    const now = new Date();
    try {
      const { hours } = getPlanetaryHours(now, location.lat, location.lon);
      const hoursWithInfo = hours.map((h: any) => ({ ...h, info: getPlanetInfo(h.planet) }));
      const current = hoursWithInfo.find((h: any) => now >= h.startTime && now < h.endTime);
      if (current) {
        setCurrentHour(current);
      }
    } catch (e) {
      console.error("Gezegen saati hesaplanamadı", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateHour();
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, [location]);

  if (loading || !currentHour) {
    return (
      <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl flex items-center justify-center min-h-[140px] animate-pulse">
        <Loader2 className="animate-spin text-mystic-primary" size={20} />
      </div>
    );
  }

  return (
    <Link 
      href="/analysis/planetary-hours"
      className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl relative overflow-hidden transition-all duration-300 hover:border-mystic-primary/50 hover:scale-[1.03] group block text-left"
    >
      {/* Background glow */}
      <div className="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] bg-mystic-primary/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-mystic-primary/10 transition-all" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: currentHour.info.color + '20', borderColor: currentHour.info.color, borderWidth: 1 }}>
          <span className="text-2xl" style={{ color: currentHour.info.color }}>{currentHour.info.symbol}</span>
        </div>
        <div>
          <h3 className="text-mystic-primary text-sm font-bold uppercase tracking-widest">Gezegen Saati</h3>
          <div className="flex items-center gap-1 text-mystic-text-muted text-[11px] mt-1">
            <MapPin size={10} />
            <span className="truncate max-w-[100px]" title={location.name}>{location.name}</span>
            <span className="mx-1">•</span>
            <Clock size={10} />
            <span>{currentHour.startTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - {currentHour.endTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      </div>

      <h4 className="text-lg font-bold mb-2 text-mystic-text group-hover:text-mystic-accent transition-colors">
        {currentHour.info.name} Saati
      </h4>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-mystic-text-muted">
        <span>Günün tüm saatlerini gör</span>
        <span className="text-mystic-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          İncele <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}
