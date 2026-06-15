"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AnimatedBackground() {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(0.03);

  useEffect(() => {
    // 1. Parlama (Glow) -> Opaklığı hızlıca %19 yap
    setOpacity(0.19);

    // 2. Sönme -> 750ms sonra yavaşça %3 seviyesine çek
    const timer = setTimeout(() => {
      setOpacity(0.03);
    }, 750);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-50 transition-opacity ease-in-out"
      style={{
        backgroundImage: "url('/flower-of-life.svg')",
        backgroundSize: "100px 173.205px",
        backgroundRepeat: "repeat",
        opacity: opacity,
        transitionDuration: opacity === 0.19 ? "750ms" : "1500ms"
      }}
    />
  );
}
