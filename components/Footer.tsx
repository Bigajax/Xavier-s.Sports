"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Instagram } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Logo from "@/components/Logo";
import { site } from "@/config/site";
import { waDefault } from "@/lib/whatsapp";

const cols = [
  {
    title: "Catálogo",
    links: [
      { href: "/catalogo", label: "Todas as camisas" },
      { href: "/clubes", label: "Clubes" },
      { href: "/selecoes", label: "Seleções" },
      { href: "/retro", label: "Retrô" },
      { href: "/pronta-entrega", label: "Pronta entrega" },
      { href: "/ofertas", label: "Ofertas" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { href: "/como-comprar", label: "Como comprar" },
      { href: "/guia-de-tamanhos", label: "Guia de tamanhos" },
      { href: "/personalizacao", label: "Personalização" },
      { href: "/envios", label: "Envios" },
      { href: "/trocas", label: "Trocas e devoluções" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { href: "/sobre", label: "Sobre a Xavier's Sports" },
      { href: "/privacidade", label: "Política de privacidade" },
      { href: "/termos", label: "Termos de uso" },
    ],
  },
];

/** "5544998210470" vira "(44) 99821-0470" */
function telefone(numero: string): string {
  const d = numero.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}

/**
 * O RODAPÉ (14/10/2026, no padrão do molde): a marca com o contato, as três
 * colunas de páginas, e a coluna das formas de pagamento que a loja publica
 * (Pix e cartão de crédito, sem bandeira inventada). Embaixo, as redes, o
 * nome com o ano e a assinatura do estúdio.
 *
 * O e-mail saiu: o de config/site.ts é exemplo, marcado para o dono
 * preencher, e contato inventado no rodapé é pior que contato nenhum.
 */
export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/painel")) return null;
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-white/70">{site.tagline}</p>
            <div className="mt-5 space-y-2.5 text-sm text-white/80">
              <a href={waDefault()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amarelo">
                <WhatsAppIcon className="h-4 w-4 text-whats" aria-hidden="true" />
                {telefone(site.whatsapp)}
              </a>
              <p className="text-white/60">{site.businessHours}</p>
            </div>
          </div>

          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-bold text-white">{col.title}</p>
              <ul className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-amarelo">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-sm font-bold text-white">Pagamento</p>
            <ul className="mt-3 flex flex-wrap gap-2 md:mt-4">
              <li>
                <svg viewBox="0 0 56 36" className="h-10 w-16" role="img" aria-label="Pix">
                  <rect x="0.5" y="0.5" width="55" height="35" rx="4" fill="#fff" />
                  <path d="M17 11.5 22.5 17a2 2 0 0 1 0 2.8L17 25.3a2 2 0 0 1-2.8 0L8.7 19.8a2 2 0 0 1 0-2.8l5.5-5.5a2 2 0 0 1 2.8 0z" fill="none" stroke="#32BCAD" strokeWidth="2.2" />
                  <text x="26" y="22.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="12" fill="#32BCAD">pix</text>
                </svg>
              </li>
              <li className="flex h-10 items-center gap-1.5 rounded bg-white px-3 text-xs font-bold text-ink">
                <CreditCard className="h-4 w-4 text-roxo" aria-hidden="true" />
                Cartão de crédito
              </li>
            </ul>
            <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-white/50">Em até 3x no cartão. Frete calculado no atendimento.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram da ${site.name}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-amarelo">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </span>
            {site.instagram}
          </a>
          <p className="max-w-xl text-xs leading-relaxed text-white/40 md:text-center">
            {site.name} © {ano}. Marcas, nomes e escudos pertencem aos seus respectivos titulares. Disponibilidade, pagamento e envio são confirmados pela equipe no atendimento.
          </p>
          <a href="https://rafaelrazeira.com.br/vitrine-digital" target="_blank" rel="noopener noreferrer" aria-label="Vitrine feita por Rafael Razeira Estúdio" className="flex items-center gap-3 text-sm text-white/55 transition-colors hover:text-white">
            <span>vitrine por</span>
            <span
              role="img"
              aria-hidden="true"
              className="inline-block bg-current"
              style={{ height: 46, width: Math.round(46 * (956 / 519)), WebkitMaskImage: "url(/marca/rafael-razeira.webp)", maskImage: "url(/marca/rafael-razeira.webp)", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
