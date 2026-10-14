"use client";

import { usePathname } from "next/navigation";
import { Medidor } from "@vitrine/plataforma/estudio/componentes/Medidor";

/**
 * A contagem do estúdio (visitas, peças abertas e cliques no WhatsApp), que
 * alimenta a aba Desempenho do painel (14/10/2026). Fora do painel: o site
 * e o painel dividem o mesmo layout raiz, e o dono mexendo no painel não é
 * visita. O Medidor só conta no domínio da loja (loja.config.ts, hostsMedir).
 */
export default function MedidorDoSite() {
  const pathname = usePathname();
  if (pathname.startsWith("/painel")) return null;
  return <Medidor />;
}
