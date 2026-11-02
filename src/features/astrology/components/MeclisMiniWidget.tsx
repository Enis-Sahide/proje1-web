'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MeclisMiniWidget() {
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      try {
        const [roomsRes, notifRes] = await Promise.all([
          fetch('/api/chat/rooms', { credentials: 'include' }),
          fetch('/api/chat/notifications', { credentials: 'include' }),
        ]);
        const roomsData = await roomsRes.json();
        const notifData = await notifRes.json();
        if (!active) return;

        if (roomsData?.success && Array.isArray(roomsData.rooms)) {
          const sum = roomsData.rooms.reduce((acc: number, r: any) => acc + (r.messageCount || 0), 0);
          setTotalMessages(sum);
        }
        if (notifData?.success) {
          setUnreadCount(notifData.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    };

    void loadSummary();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      href="/meclis"
      className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-5 border border-mystic-surface-light w-full max-w-sm shadow-xl relative overflow-hidden transition-all duration-300 hover:border-purple-400/50 hover:scale-[1.03] group/meclis block"
    >
      <div className="absolute top-[-20%] right-[-20%] w-[45%] h-[45%] bg-purple-500/10 blur-[30px] rounded-full pointer-events-none transition-all duration-300 group-hover/meclis:bg-purple-500/20" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/15 border border-purple-400/30 shadow-inner group-hover/meclis:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 text-[10px] font-bold uppercase tracking-widest block">
                7Layers Kadim Meclis
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold">
                  {unreadCount} Yanıt
                </span>
              )}
            </div>
            <h4 className="text-white font-extrabold text-sm mt-0.5 tracking-tight group-hover/meclis:text-purple-200 transition-colors">
              Ezoterik Sohbet Odaları (8 Oda)
            </h4>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover/meclis:border-purple-400/40 transition-colors">
          <ArrowRight className="w-4 h-4 text-mystic-text-muted group-hover/meclis:text-purple-300 transition-colors" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-mystic-text-muted">
        <span className="truncate max-w-[210px] italic">
          🏛️ {totalMessages !== null ? `${totalMessages} meclis paylaşımı • Canlı` : 'Kabala, Sembolizm & Astroloji'}
        </span>
        <span className="text-purple-300 font-bold flex items-center gap-1 group-hover/meclis:translate-x-1 transition-transform">
          Meclise Katıl <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}
