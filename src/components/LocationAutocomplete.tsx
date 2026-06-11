"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';

interface LocationAutocompleteProps {
  onSelect: (city: AstroCity) => void;
  defaultDisplay?: string;
  placeholder?: string;
  className?: string;
}

export default function LocationAutocomplete({ onSelect, defaultDisplay = '', placeholder = 'Şehir Ara...', className = '' }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(defaultDisplay);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=tr`);
        const data = await response.json();
        
        if (data.results) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Geocoding API Error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCities, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: any) => {
    const displayStr = `${result.name}, ${result.admin1 || ''} ${result.country}`;
    setQuery(displayStr.replace(/, \s*/g, ', ').replace(/ ,/g, ','));
    setIsOpen(false);

    const city: AstroCity = {
      name: result.name,
      lat: result.latitude,
      lon: result.longitude,
      country: result.country,
      tz: result.timezone || 'Europe/Istanbul'
    };

    onSelect(city);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={className}
        required
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3.5">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-[#0F172A] border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li
              key={result.id}
              onClick={() => handleSelect(result)}
              className="px-4 py-3 hover:bg-white/10 cursor-pointer text-white border-b border-white/5 last:border-0 transition-colors"
            >
              <div className="font-bold">{result.name}</div>
              <div className="text-xs text-mystic-text-muted">
                {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && query.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#0F172A] border border-white/20 rounded-xl shadow-2xl p-4 text-center text-mystic-text-muted">
          Sonuç bulunamadı
        </div>
      )}
    </div>
  );
}
