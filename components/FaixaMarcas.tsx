"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * "ESCOLHA PELA MARCA" (14/10/2026, a faixa do molde, nascida na Padel&Co.):
 * os fabricantes das camisas, com uma seta de cada lado, andando uma logo a
 * cada 3 s, e cada logo leva às camisas da marca (/catalogo?marca=). Só a
 * LOGO OFICIAL em arquivo, nunca o nome escrito (lib/fabricantes.ts).
 *
 * As logos são máscara, pintadas na cor do texto, numa caixa de altura fixa:
 * marcas de desenho diferente ficam do mesmo peso. Mouse, dedo ou foco
 * pausam; com "reduzir movimento", não anda sozinha. O trilho tem
 * overflow-y hidden, senão come a roda do mouse.
 */
export default function FaixaMarcas({ marcas }: { marcas: { slug: string; nome: string; logo: string; total: number }[] }) {
  const trilho = useRef<HTMLUListElement>(null);
  const [parado, setParado] = useState(false);

  const andar = (passo: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    const item = el.querySelector("li");
    const largura = item ? item.getBoundingClientRect().width : el.clientWidth / 3;
    const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (passo > 0 && fim) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (passo < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: passo * largura, behavior: "smooth" });
  };

  useEffect(() => {
    if (parado || marcas.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === "visible") andar(1);
    }, 3000);
    return () => window.clearInterval(relogio);
  }, [parado, marcas.length]);

  if (!marcas.length) return null;

  const seta = (passo: 1 | -1) => (
    <button type="button" className="xs-marcas__seta" onClick={() => andar(passo)} aria-label={passo < 0 ? "Marcas anteriores" : "Próximas marcas"}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={passo < 0 ? "M14.5 5.5L8 12l6.5 6.5" : "M9.5 5.5L16 12l-6.5 6.5"} />
      </svg>
    </button>
  );

  return (
    <section
      className="xs-marcas"
      aria-labelledby="xs-marcas-titulo"
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onTouchStart={() => setParado(true)}
      onFocus={() => setParado(true)}
      onBlur={() => setParado(false)}
    >
      <h2 id="xs-marcas-titulo" className="xs-marcas__titulo display">
        Escolha pela marca
      </h2>
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 md:px-6">
        {seta(-1)}
        <ul ref={trilho} className="xs-marcas__trilho">
          {marcas.map((m) => (
            <li key={m.slug}>
              <Link href={`/catalogo?marca=${m.slug}`} className="xs-marcas__item" aria-label={`Camisas ${m.nome}`}>
                <span className="xs-marcas__logo" style={{ WebkitMaskImage: `url(${m.logo})`, maskImage: `url(${m.logo})` }} />
                <span className="xs-marcas__conta">
                  {m.total} {m.total === 1 ? "camisa" : "camisas"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {seta(1)}
      </div>
    </section>
  );
}
