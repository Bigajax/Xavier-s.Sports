"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CreditCard, Repeat, Truck } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

/* só o que a loja já publica (config/site.ts, /trocas e /envios). O 3x vale
   para 252 das 259 camisas; as outras parcelam em 2x */
const garantias = [
  { icon: WhatsAppIcon, title: "Atendimento no WhatsApp", text: "Segunda a sábado, das 9h às 18h" },
  { icon: Repeat, title: "Troca de tamanho", text: "Veja as condições em Trocas" },
  { icon: Truck, title: "Envio para todo o Brasil", text: "Frete calculado no atendimento" },
  { icon: CreditCard, title: "Pix ou cartão", text: "Em até 3x no cartão" },
];

/**
 * A FAIXA DE GARANTIAS, colada no rodapé em todas as páginas (14/10/2026, no
 * padrão do molde; redesenhada no mesmo dia, pedido do Rafael: "ajusta aqui").
 * No desenho limpo da faixa de benefícios: sem as caixas amarelas inclinadas
 * e sem os títulos em caixa alta, o ícone simples, o título curto, uma linha
 * e um fio entre os itens. No celular, UMA por vez com uma setinha de cada
 * lado; a partir do notebook, as quatro lado a lado.
 */
export default function FaixaGarantias() {
  const pathname = usePathname();
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const ir = (i: number) => setAtual(((i % garantias.length) + garantias.length) % garantias.length);

  useEffect(() => {
    if (parado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === "visible") setAtual((i) => (i + 1) % garantias.length);
    }, 4000);
    return () => window.clearInterval(relogio);
  }, [parado]);

  if (pathname.startsWith("/admin")) return null;

  const seta = (passo: 1 | -1) => (
    <button
      type="button"
      onClick={() => {
        setParado(true);
        ir(atual + passo);
      }}
      aria-label={passo < 0 ? "Garantia anterior" : "Próxima garantia"}
      className="grid h-10 w-10 shrink-0 place-items-center text-white/50 hover:text-amarelo lg:hidden"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={passo < 0 ? "M14.5 5.5L8 12l6.5 6.5" : "M9.5 5.5L16 12l-6.5 6.5"} />
      </svg>
    </button>
  );

  return (
    <section aria-label="Garantias" className="bg-roxo-escuro text-white" onTouchStart={() => setParado(true)}>
      <div className="mx-auto flex max-w-7xl items-center px-2 py-4 md:px-6 lg:py-6">
        {seta(-1)}
        <ul className="grid min-w-0 flex-1 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
          {garantias.map((g, i) => (
            <li key={g.title} className={`items-center gap-3 lg:flex lg:justify-center lg:px-4 ${i === atual ? "flex justify-center" : "hidden"}`}>
              <g.icon className="h-6 w-6 shrink-0 text-amarelo" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-bold">{g.title}</p>
                <p className="mt-0.5 text-[0.8125rem] text-white/65">{g.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {seta(1)}
      </div>
    </section>
  );
}
