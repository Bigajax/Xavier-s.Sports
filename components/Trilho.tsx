"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products/types";
import ProductCard from "@/components/ProductCard";

/**
 * A FILEIRA EM TRILHO (14/10/2026, no padrão do molde): quatro peças no
 * computador e duas no celular, com setas nas duas telas, andando uma peça a
 * cada 4 s e voltando ao começo no fim. Para com o mouse, o dedo ou o foco, e
 * só anda com a aba visível e o trilho na tela. O "Ver mais" fica embaixo, no
 * meio. O trilho tem overflow-y hidden: senão come a roda do mouse.
 */
export default function Trilho({
  id,
  titulo,
  linha,
  href,
  verMais = "Ver mais",
  produtos,
  pronta = false,
  fundo = "branco",
  total,
}: {
  /** quantas camisas há na lista inteira (o "Ver as N" do cabeçalho) */
  total?: number;
  id: string;
  titulo: string;
  linha?: string;
  href: string;
  verMais?: string;
  produtos: Product[];
  pronta?: boolean;
  fundo?: "branco" | "cinza";
}) {
  const trilho = useRef<HTMLUListElement>(null);
  const [parado, setParado] = useState(false);
  const [naTela, setNaTela] = useState(false);

  const andar = (passo: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    const item = el.querySelector("li");
    const largura = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth / 2;
    const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (passo > 0 && fim) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (passo < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: passo * largura, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trilho.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (parado || !naTela || produtos.length < 3 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === "visible") andar(1);
    }, 4000);
    return () => window.clearInterval(relogio);
  }, [parado, naTela, produtos.length]);

  if (!produtos.length) return null;

  const seta = (passo: 1 | -1) => (
    <button type="button" className={`xs-trilho__seta xs-trilho__seta--${passo < 0 ? "antes" : "depois"}`} onClick={() => andar(passo)} aria-label={passo < 0 ? `${titulo}: voltar` : `${titulo}: mais camisas`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={passo < 0 ? "M14.5 5.5L8 12l6.5 6.5" : "M9.5 5.5L16 12l-6.5 6.5"} />
      </svg>
    </button>
  );

  return (
    <section id={id} className={`xs-fileira ${fundo === "cinza" ? "bg-cloud" : "bg-white"}`} aria-labelledby={`${id}-titulo`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* o cabeçalho (14/10/2026, pedido do Rafael: "melhora o design,
            título e subtítulo"): o traço amarelo inclinado da marca antes do
            título, o subtítulo legível, e a contagem real à direita */}
        <header className="xs-fileira__cabeca flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h2 id={`${id}-titulo`} className="display flex items-center gap-3 text-3xl leading-none text-ink sm:text-[2.75rem]">
              <span className="h-7 w-2.5 shrink-0 -skew-x-[8deg] bg-amarelo sm:h-9" aria-hidden="true" />
              {titulo}
            </h2>
            {linha ? <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-snug text-ink/65 sm:text-base">{linha}</p> : null}
          </div>
          {total ? (
            <Link href={href} className="hidden shrink-0 pb-1 text-sm font-bold text-roxo underline-offset-4 hover:underline md:block">
              Ver as {total}
            </Link>
          ) : null}
        </header>
        <div
          className="xs-trilho"
          onMouseEnter={() => setParado(true)}
          onMouseLeave={() => setParado(false)}
          onTouchStart={() => setParado(true)}
          onFocus={() => setParado(true)}
          onBlur={() => setParado(false)}
        >
          {seta(-1)}
          <ul ref={trilho} className="xs-trilho__fila">
            {produtos.map((p) => (
              <li key={p.slug} className="xs-trilho__peca">
                <ProductCard product={p} ready={pronta} />
              </li>
            ))}
          </ul>
          {seta(1)}
        </div>
        <div className="mt-6 flex justify-center">
          <Link href={href} className="xs-fileira__ver">
            {verMais}
          </Link>
        </div>
      </div>
    </section>
  );
}
