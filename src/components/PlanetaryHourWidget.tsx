'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Search, X, Loader2 } from 'lucide-react';
import { getPlanetaryHours, getPlanetInfo } from '@/utils/PlanetaryHours';

export default function PlanetaryHourWidget() {
  const [currentHour, setCurrentHour] = useState<any>(null);
  const [location, setLocation] = useState({ lat: 41.0082, lon: 28.9784, name: 'İstanbul' });
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [allHours, setAllHours] = useState<any[]>([]);

  const updateHour = () => {
    const now = new Date();
    try {
      const { hours } = getPlanetaryHours(now, location.lat, location.lon);
      const hoursWithInfo = hours.map((h: any) => ({ ...h, info: getPlanetInfo(h.planet) }));
      setAllHours(hoursWithInfo);

      const current = hoursWithInfo.find((h: any) => now >= h.startTime && now < h.endTime);
      if (current) {
        setCurrentHour(current);
      }
    } catch (e) {
      console.error("Gezegen saati hesaplanamadı", e);
    }
  };

  useEffect(() => {
    updateHour();
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, [location]);

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
    const locName = result.admin1 ? `${result.name}, ${result.admin1}` : result.name;
    setLocation({ lat: result.latitude, lon: result.longitude, name: locName });
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!currentHour) return null;

  return (
    <div 
      className={`bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl relative overflow-hidden transition-all duration-300 ${!isSearching ? 'cursor-pointer hover:border-mystic-primary group' : ''}`}
      onClick={() => !isSearching && setIsSearching(true)}
    >
      {!isSearching && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-mystic-text-muted">
          <Search size={16} />
        </div>
      )}

      {isSearching ? (
        <div className="flex flex-col h-full min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-mystic-primary text-sm font-bold uppercase tracking-widest">Konum Seç</h3>
            <button onClick={(e) => { e.stopPropagation(); setIsSearching(false); }} className="text-mystic-text-muted hover:text-mystic-text">
              <X size={18} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
              <Search size={14} />
            </div>
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Şehir, ülke arayın..."
              className="w-full bg-mystic-dark/50 border border-mystic-surface-light rounded-lg py-2 pl-9 pr-4 text-sm text-mystic-text placeholder-mystic-text-muted focus:outline-none focus:border-mystic-accent"
            />
            {isSearchingApi && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-mystic-accent">
                <Loader2 size={14} className="animate-spin" />
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] scrollbar-thin scrollbar-thumb-mystic-surface-light">
            {searchResults.length > 0 ? (
              searchResults.map((res: any) => (
                <button
                  key={res.id}
                  onClick={(e) => { e.stopPropagation(); selectLocation(res); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-mystic-primary/10 transition-colors flex flex-col"
                >
                  <span className="text-sm font-medium text-mystic-text">{res.name}</span>
                  <span className="text-xs text-mystic-text-muted">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                </button>
              ))
            ) : searchQuery.length >= 2 && !isSearchingApi ? (
              <div className="text-center text-xs text-mystic-text-muted py-4">Sonuç bulunamadı.</div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: currentHour.info.color + '20', borderColor: currentHour.info.color, borderWidth: 1 }}>
              <span className="text-2xl" style={{ color: currentHour.info.color }}>{currentHour.info.symbol}</span>
            </div>
            <div>
              <h3 className="text-mystic-primary text-sm font-bold uppercase tracking-widest">Şu Anki Gezegen Saati</h3>
              <div className="flex items-center gap-1 text-mystic-text-muted text-xs mt-1">
                <MapPin size={10} />
                <span className="truncate max-w-[80px]" title={location.name}>{location.name}</span>
                <span className="mx-1">•</span>
                <Clock size={10} />
                <span>{currentHour.startTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - {currentHour.endTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
          <h4 className="text-lg font-bold mb-2 text-mystic-text">{currentHour.info.name} Saati</h4>
          <p className="text-mystic-text-muted text-sm leading-relaxed mb-4">
            {currentHour.info.description}
          </p>

          <div className="border-t border-mystic-surface-light pt-3 mt-1">
            <h5 className="text-[10px] font-bold text-mystic-text-muted uppercase tracking-wider mb-2">Günün Tüm Saatleri</h5>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-mystic-surface-light">
              {allHours.map((h, idx) => {
                const isCurrent = h.startTime === currentHour.startTime;
                return (
                  <div key={idx} className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors ${isCurrent ? 'bg-mystic-primary/10 border border-mystic-primary/20' : 'hover:bg-mystic-surface-light'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base" style={{ color: h.info.color }}>{h.info.symbol}</span>
                      <span className="text-xs font-medium" style={{ color: isCurrent ? h.info.color : '#e2e8f0' }}>{h.info.name}</span>
                    </div>
                    <span className={`text-[11px] ${isCurrent ? 'text-mystic-primary font-bold' : 'text-mystic-text-muted'}`}>
                      {h.startTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - {h.endTime.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
