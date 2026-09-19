"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_ID_KEY = '7l_vid';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    // Set persistent cookie for 1 year
    document.cookie = `${VISITOR_ID_KEY}=${vid}; path=/; max-age=31536000; SameSite=Lax`;
    return vid;
  } catch {
    return '';
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Admin panel actions should not pollute public analytics
    if (!pathname || pathname.startsWith('/admin')) {
      return;
    }

    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const visitorId = getOrCreateVisitorId();

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        path: pathname,
        visitorId: visitorId || undefined,
      })
    }).catch(err => console.error('Failed to track page view:', err));
  }, [pathname]);

  return null;
}
