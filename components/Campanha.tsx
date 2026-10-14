"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BannerTopo } from "@/data/banners";

const TEMPO = 6000;

/**
 * OS 3 BANNERS DO TOPO (14/10/2026, no padrão do molde). No computador, a
 * arte deitada de ponta a ponta, o texto no lado vazio dela e as setas finas
 * nas bordas. No celular, a arte em pé, o texto no pé por cima do escuro e as
 * três bolinhas, com o arrastar do dedo. Troca sozinho a cada 6 s, para com o
 * mouse, o dedo ou o foco, e não anda para quem pediu menos movimento.
 */
export default function Campanha({ banners }: { banners: BannerTopo[] }) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const toque = useRef<number | null>(null);
  const raiz = useRef<HTMLElement>(null);
  const total = banners.length;
  const ir = useCallback((i: number) => setAtual(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (parado || total < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      if (document.visibilityState === "visible") ir(atual + 1);
    }, TEMPO);
    return () => window.clearTimeout(t);
  }, [atual, parado, ir, total]);

  return (
    <section
      ref={raiz}
      aria-roledescription="carrossel"
      aria-label="Campanhas da Xavier's Sports"
      className="xs-campanha"
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocus={() => setParado(true)}
      onBlur={(e) => {
        if (!raiz.current?.contains(e.relatedTarget as Node)) setParado(false);
      }}
      onTouchStart={(e) => {
        toque.current = e.touches[0].clientX;
        setParado(true);
      }}
      onTouchEnd={(e) => {
        if (toque.current === null) return;
        const dx = e.changedTouches[0].clientX - toque.current;
        toque.current = null;
        if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
      }}
    >
      {banners.map((b, i) => {
        const ativo = i === atual;
        return (
          <div
            key={b.arte}
            className="xs-campanha__slide"
            data-ativo={ativo}
            data-lado={b.lado}
            aria-hidden={!ativo}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}`}
          >
            <picture>
              <source media="(max-width: 767px)" srcSet={b.arteCelular} />
              <img src={b.arte} alt={b.alt} className="xs-campanha__arte" fetchPriority={i === 0 ? "high" : "auto"} loading={i === 0 ? "eager" : "lazy"} />
            </picture>
            <div className="xs-campanha__texto">
              {i === 0 ? <h1 className="xs-campanha__titulo display">{b.titulo}</h1> : <h2 className="xs-campanha__titulo display">{b.titulo}</h2>}
              <p className="xs-campanha__linha">{b.linha}</p>
              <Link href={b.href} tabIndex={ativo ? 0 : -1} className="xavier-tag xs-campanha__botao">
                <span>{b.botao}</span>
              </Link>
            </div>
          </div>
        );
      })}

      {total > 1 ? (
        <>
          <button type="button" className="xs-campanha__seta xs-campanha__seta--antes" onClick={() => ir(atual - 1)} aria-label="Banner anterior">
            <svg viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M20 2L4 24l16 22" />
            </svg>
          </button>
          <button type="button" className="xs-campanha__seta xs-campanha__seta--depois" onClick={() => ir(atual + 1)} aria-label="Próximo banner">
            <svg viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 2l16 22L4 46" />
            </svg>
          </button>
          <div className="xs-campanha__pontos">
            {banners.map((b, i) => (
              <button key={b.arte} type="button" onClick={() => ir(i)} aria-label={`Ir para o banner ${i + 1}`} aria-current={i === atual ? "true" : undefined} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
