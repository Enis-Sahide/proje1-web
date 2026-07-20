'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Search, Loader2, Calendar, Sun, Moon } from 'lucide-react';
import { getPlanetaryHours, getPlanetInfo, PLANET_DAY_GUIDELINES } from '@/utils/PlanetaryHours';

export default function PlanetaryHoursPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState({ lat: 41.0082, lon: 28.9784, name: 'İSTANBUL' });
  const [hoursData, setHoursData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load location from localStorage
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

  // Update current time tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate hours when location or selected date changes
  useEffect(() => {
    try {
      const data = getPlanetaryHours(selectedDate, location.lat, location.lon);
      const hoursWithInfo = data.hours.map((h: any) => ({ ...h, info: getPlanetInfo(h.planet) }));
      setHoursData({
        dayHours: hoursWithInfo.filter((h: any) => h.isDay),
        nightHours: hoursWithInfo.filter((h: any) => !h.isDay),
        sunrise: data.sunrise,
        sunset: data.sunset
      });
    } catch (e) {
      console.error("Gezegen saatleri hesaplanamadı", e);
    }
  }, [location, selectedDate]);

  // Geocoding search logic
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchingApi(false);
      return;
    }
    setIsSearchingApi(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=tr&format=json`);
        const data = await res.json();
        if (data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setIsSearchingApi(false);
      }
    }, 500);
  };

  const selectLocation = (result: any) => {
    const locName = result.admin1 ? `${result.name}, ${result.admin1}`.toUpperCase() : result.name.toUpperCase();
    const newLoc = { lat: result.latitude, lon: result.longitude, name: locName };
    setLocation(newLoc);
    localStorage.setItem('last_planet_hours_location', JSON.stringify(newLoc));
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Next 7 days list
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const datesList = getNext7Days();

  // Selected Day info for ruling planet
  const selectedDayOfWeek = selectedDate.getDay(); // 0: Sunday, 1: Monday...
  const planetKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetKey = planetKeys[selectedDayOfWeek];
  const dayGuideline = PLANET_DAY_GUIDELINES[currentPlanetKey];

  const isCurrentHour = (start: Date, end: Date) => {
    const now = new Date();
    // Check if selectedDate is today
    const isToday = selectedDate.toDateString() === now.toDateString();
    return isToday && currentTime >= start && currentTime < end;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-mystic-dark text-mystic-text flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mystic-primary/10 via-mystic-dark to-mystic-dark pointer-events-none z-0" />

      <div className="max-w-6xl w-full mx-auto px-4 py-8 relative z-10 flex-grow">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-mystic-text-muted hover:text-mystic-accent transition-colors self-start py-2 px-3 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            <span>Ana Sayfa</span>
          </button>
          
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-mystic-accent to-white tracking-tight text-center md:text-left">
            Gezegen Saatleri ve Günlük Ritüeller
          </h1>
          
          <div className="w-[100px]" />
        </div>

        {/* Top Info & City Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Location and Search Card */}
          <div className="bg-mystic-surface/40 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light shadow-xl relative">
            <h2 className="text-mystic-primary text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin size={12} /> Hesaplama Konumu
            </h2>
            
            {!isSearching ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-white">{location.name}</div>
                  <div className="text-[11px] text-mystic-text-muted mt-1">
                    Koordinat: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
                  </div>
                </div>
                <button 
                  onClick={() => setIsSearching(true)}
                  className="p-2.5 rounded-lg bg-mystic-primary/10 text-mystic-primary hover:bg-mystic-primary/20 hover:text-white transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input 
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Şehir adı yazın..."
                    className="w-full bg-mystic-dark/60 border border-mystic-surface-light rounded-lg py-2 pl-3 pr-8 text-sm text-white placeholder-mystic-text-muted focus:outline-none focus:border-mystic-accent"
                  />
                  {isSearchingApi ? (
                    <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-mystic-accent" />
                  ) : (
                    <button 
                      onClick={() => { setIsSearching(false); setSearchQuery(''); setSearchResults([]); }}
                      className="absolute right-3 top-2.5 text-mystic-text-muted hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="bg-mystic-dark border border-mystic-surface-light rounded-lg overflow-hidden max-h-[150px] overflow-y-auto">
                    {searchResults.map((res: any) => (
                      <button
                        key={res.id}
                        onClick={() => selectLocation(res)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-mystic-primary/15 transition-colors border-b border-white/5 last:border-0 flex flex-col"
                      >
                        <span className="font-semibold text-white">{res.name}</span>
                        <span className="text-[10px] text-mystic-text-muted">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Selector Tabs (7 Days) */}
          <div className="lg:col-span-2 bg-mystic-surface/40 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light shadow-xl">
            <h2 className="text-mystic-primary text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar size={12} /> Tarih Seçimi
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-mystic-surface-light">
              {datesList.map((d, index) => {
                const isSelected = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                const isToday = index === 0;
                const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                const dayStr = d.toLocaleDateString('tr-TR', { weekday: 'short' });
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(d)}
                    className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl border text-center transition-all ${
                      isSelected 
                        ? 'bg-mystic-primary/10 border-mystic-primary text-mystic-accent font-semibold scale-[1.02]' 
                        : 'border-white/5 hover:border-white/10 text-mystic-text-muted hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] uppercase opacity-75">{isToday ? 'Bugün' : dayStr}</div>
                    <div className="text-sm mt-0.5">{dateStr}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Layout (Guidelines + Planetary Hours List) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Planetary Day Guidelines Card */}
          <div className="lg:col-span-1">
            {dayGuideline && (
              <div className="bg-mystic-surface/40 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light shadow-xl relative overflow-hidden sticky top-6">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-mystic-primary/5 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: dayGuideline.color + '20', color: dayGuideline.color, borderColor: dayGuideline.color, borderWidth: 1 }}>
                    {dayGuideline.symbol}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{dayGuideline.name} Günü Enerjisi</h3>
                    <p className="text-[10px] text-mystic-text-muted uppercase tracking-widest mt-0.5">
                      {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })} Günü Yöneticisi
                    </p>
                  </div>
                </div>

                <div className="space-y-4 leading-relaxed text-sm">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <strong className="text-emerald-400 block mb-1 text-xs uppercase tracking-wider">✓ Yapılması Önerilenler:</strong>
                    <p className="text-mystic-text text-[12px]">{dayGuideline.do}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <strong className="text-rose-400 block mb-1 text-xs uppercase tracking-wider">✗ Kaçınılması Gerekenler:</strong>
                    <p className="text-mystic-text text-[12px]">{dayGuideline.avoid}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Gündüz and Gece Saatleri Scroll lists */}
          <div className="lg:col-span-2 space-y-8">
            
            {hoursData ? (
              <>
                {/* Gündüz Saatleri */}
                <div className="bg-mystic-surface/20 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light shadow-xl">
                  <h3 className="text-mystic-accent font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sun size={14} className="text-mystic-accent" /> Gündüz Gezegen Saatleri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hoursData.dayHours.map((hour: any, idx: number) => {
                      const isActive = isCurrentHour(hour.startTime, hour.endTime);
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isActive 
                              ? 'bg-mystic-primary/10 border-mystic-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                              : 'bg-mystic-surface/40 border-white/5 hover:border-white/10'
                          }`}
                          style={{ borderLeftColor: hour.info.color, borderLeftWidth: 4 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl" style={{ color: hour.info.color }}>{hour.info.symbol}</span>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {hour.index}. Saat: {hour.info.name}
                              </div>
                              <div className="text-[10px] text-mystic-text-muted mt-0.5">
                                Gündüz Saati
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-mono text-white">
                              {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                            </span>
                            {isActive && (
                              <div className="text-[9px] text-mystic-accent font-extrabold uppercase tracking-widest mt-0.5 animate-pulse">
                                ŞU AN
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gece Saatleri */}
                <div className="bg-mystic-surface/20 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light shadow-xl">
                  <h3 className="text-mystic-primary font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Moon size={14} className="text-mystic-primary" /> Gece Gezegen Saatleri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hoursData.nightHours.map((hour: any, idx: number) => {
                      const isActive = isCurrentHour(hour.startTime, hour.endTime);
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isActive 
                              ? 'bg-mystic-primary/10 border-mystic-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                              : 'bg-mystic-surface/40 border-white/5 hover:border-white/10'
                          }`}
                          style={{ borderLeftColor: hour.info.color, borderLeftWidth: 4 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl" style={{ color: hour.info.color }}>{hour.info.symbol}</span>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {hour.index}. Saat: {hour.info.name}
                              </div>
                              <div className="text-[10px] text-mystic-text-muted mt-0.5">
                                Gece Saati
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-mono text-white">
                              {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                            </span>
                            {isActive && (
                              <div className="text-[9px] text-mystic-accent font-extrabold uppercase tracking-widest mt-0.5 animate-pulse">
                                ŞU AN
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-mystic-primary" size={24} />
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
