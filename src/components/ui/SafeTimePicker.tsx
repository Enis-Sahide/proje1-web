"use client";

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';

interface SafeTimePickerProps {
  value: string; // "HH:mm" formatında
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SafeTimePicker({
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
}: SafeTimePickerProps) {
  // Mevcut saat ve dakikayı ayrıştır
  const [currentHour, currentMinute] = useMemo(() => {
    if (!value || !value.includes(':')) {
      return ['12', '00'];
    }
    const [h, m] = value.split(':');
    return [
      (h || '12').padStart(2, '0'),
      (m || '00').padStart(2, '0'),
    ];
  }, [value]);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    onChange(`${newHour}:${currentMinute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    onChange(`${currentHour}:${newMinute}`);
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <select
          value={currentHour}
          onChange={handleHourChange}
          disabled={disabled}
          required={required}
          aria-label="Doğum Saati"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-base text-white appearance-none focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer text-center font-medium disabled:opacity-50 touch-manipulation"
        >
          {hours.map((h) => (
            <option key={h} value={h} className="bg-[#18181b] text-white py-1">
              Saat: {h}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">
          ▼
        </span>
      </div>

      <span className="text-white/60 font-bold text-lg select-none">:</span>

      <div className="relative flex-1">
        <select
          value={currentMinute}
          onChange={handleMinuteChange}
          disabled={disabled}
          required={required}
          aria-label="Doğum Dakikası"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-base text-white appearance-none focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer text-center font-medium disabled:opacity-50 touch-manipulation"
        >
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-[#18181b] text-white py-1">
              Dk: {m}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">
          ▼
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-center p-3 bg-white/5 rounded-xl border border-white/10 text-[#D4AF37]">
        <Clock size={18} />
      </div>
    </div>
  );
}
