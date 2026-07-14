"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, MessageCircle } from "lucide-react";
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
      { href: "/lancamentos", label: "Lançamentos" },
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

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-white/70">{site.tagline}</p>
            <div className="mt-5 space-y-2 text-sm text-white/70">
              <a
                href={waDefault()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amarelo"
              >
                <MessageCircle className="h-4 w-4 text-whats" aria-hidden="true" />
                WhatsApp da loja
              </a>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amarelo"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {site.instagram}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 hover:text-amarelo"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {site.email}
              </a>
              <p>{site.businessHours}</p>
            </div>
          </div>

          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="xavier-eyebrow text-amarelo">{col.title}</p>
              <ul className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 hover:text-amarelo"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-white/50 md:mt-12">
          <p>
            {site.name}. Todos os direitos reservados.
          </p>
          <p className="mt-1">
            Marcas, nomes e escudos pertencem aos seus respectivos titulares.
            Disponibilidade, pagamento e envio são confirmados pela equipe no
            atendimento.
          </p>
        </div>
      </div>
    </footer>
  );
}
