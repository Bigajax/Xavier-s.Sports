"use client";

import { useEffect, useState } from "react";
import { CreditCard, PackageCheck, Shirt } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

/* o que faz comprar aqui, sem repetir a faixa de garantias do rodapé (que já
   fala de envio e troca). Cada frase é da loja: a pronta entrega, o 3x (252
   das 259 camisas), a personalização e o atendimento. */
const benefits = [
  { icon: PackageCheck, title: "Pronta entrega", text: "Camisas já em estoque" },
  { icon: CreditCard, title: "Em até 3x no cartão", text: "Ou à vista no Pix" },
  { icon: Shirt, title: "Nome e número", text: "Personalize a sua camisa" },
  { icon: WhatsAppIcon, title: "Atendimento no WhatsApp", text: "Tire dúvidas de tamanho e modelo" },
];

/**
 * A faixa de benefícios, logo abaixo dos banners (14/10/2026, no padrão do
 * molde; redesenhada no mesmo dia, pedido do Rafael: "mais clean"). Sem as
 * caixas lilás inclinadas e sem os títulos em caixa alta: o ícone simples,
 * o título curto e uma linha, com um fio entre os itens. No computador, os
 * quatro lado a lado; no celular, UM por vez com uma setinha de cada lado.
 */
export default function BenefitsBar() {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const ir = (i: number) => setAtual(((i % benefits.length) + benefits.length) % benefits.length);

  useEffect(() => {
    if (parado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === "visible") setAtual((i) => (i + 1) % benefits.length);
    }, 4000);
    return () => window.clearInterval(relogio);
  }, [parado]);

  const seta = (passo: 1 | -1) => (
    <button
      type="button"
      onClick={() => {
        setParado(true);
        ir(atual + passo);
      }}
      aria-label={passo < 0 ? "Benefício anterior" : "Próximo benefício"}
      className="grid h-10 w-10 shrink-0 place-items-center text-ink/50 hover:text-roxo lg:hidden"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={passo < 0 ? "M14.5 5.5L8 12l6.5 6.5" : "M9.5 5.5L16 12l-6.5 6.5"} />
      </svg>
    </button>
  );

  return (
    <section aria-label="Benefícios" className="border-b border-ink/10 bg-white" onTouchStart={() => setParado(true)}>
      <div className="mx-auto flex max-w-7xl items-center px-2 py-3.5 md:px-6 lg:py-5">
        {seta(-1)}
        <ul className="grid min-w-0 flex-1 lg:grid-cols-4 lg:divide-x lg:divide-ink/10">
          {benefits.map((b, i) => (
            <li
              key={b.title}
              className={`items-center gap-3 lg:flex lg:justify-center lg:px-4 ${i === atual ? "flex justify-center" : "hidden"}`}
            >
              <b.icon className="h-6 w-6 shrink-0 text-roxo" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-bold text-ink">{b.title}</p>
                <p className="mt-0.5 text-[0.8125rem] text-steel">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {seta(1)}
      </div>
    </section>
  );
}
