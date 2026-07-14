"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Trilho horizontal com indicação de continuação: setas nas laterais
 * (desktop) e fade na borda enquanto houver conteúdo escondido.
 * `fadeFrom`: classe from-* com a cor de fundo da seção (ex.: "from-cloud").
 */
export default function ScrollRow({
  children,
  fadeFrom = "from-white",
  ariaLabel,
}: {
  children: React.ReactNode;
  fadeFrom?: string;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role={ariaLabel ? "region" : undefined}
        aria-label={ariaLabel}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0"
      >
        {children}
      </div>

      {/* fades de continuação */}
      {canLeft && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 -left-1 hidden w-14 bg-gradient-to-r ${fadeFrom} to-transparent md:block`}
        />
      )}
      {canRight && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 -right-1 hidden w-14 bg-gradient-to-l ${fadeFrom} to-transparent md:block`}
        />
      )}

      {/* setas (desktop) */}
      {canLeft && (
        <button
          onClick={() => nudge(-1)}
          aria-label="Ver itens anteriores"
          className="absolute -left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-ink p-2.5 text-white shadow-lg transition-transform hover:scale-110 md:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => nudge(1)}
          aria-label="Ver mais itens"
          className="absolute -right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-ink p-2.5 text-white shadow-lg transition-transform hover:scale-110 md:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
