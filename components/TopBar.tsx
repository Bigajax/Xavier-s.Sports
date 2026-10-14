"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* cada frase é um fato da loja e leva a algum lugar (14/10/2026): o preço da
   versão torcedor, o 3x (252 das 259 camisas), a pronta entrega e o envio */
const messages = [
  { texto: "Camisas 26/27 e da Copa 2026 a partir de R$ 189", href: "/catalogo" },
  { texto: "Parcele em até 3x no cartão", href: "/como-comprar" },
  { texto: "Pronta entrega: camisas já em estoque", href: "/pronta-entrega" },
  { texto: "Enviamos para todo o Brasil", href: "/envios" },
];

/**
 * A faixa de avisos (14/10/2026, no padrão do molde): UMA frase por vez, em
 * todas as telas, trocando a cada 4 s. A que sai some antes de a próxima
 * entrar (antes as duas apareciam uma por cima da outra no meio da troca).
 * Sem o quadradinho amarelo: só a frase, e ela é link. Para com o mouse em
 * cima, só anda com a aba visível e não anda para quem pediu menos movimento.
 */
export default function TopBar() {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);

  useEffect(() => {
    if (parado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === "visible") setAtual((i) => (i + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(relogio);
  }, [parado]);

  return (
    <div className="bg-roxo-escuro text-white" onMouseEnter={() => setParado(true)} onMouseLeave={() => setParado(false)}>
      <div className="relative mx-auto h-8 max-w-7xl overflow-hidden px-4">
        {messages.map((m, i) => (
          <Link
            key={m.texto}
            href={m.href}
            tabIndex={i === atual ? 0 : -1}
            aria-hidden={i !== atual}
            className={`absolute inset-0 flex items-center justify-center truncate px-4 text-[0.8125rem] font-semibold tracking-wide transition-opacity motion-reduce:transition-none hover:text-amarelo ${
              i === atual ? "opacity-100 delay-200 duration-300" : "pointer-events-none opacity-0 duration-200"
            }`}
          >
            {m.texto}
          </Link>
        ))}
      </div>
    </div>
  );
}
