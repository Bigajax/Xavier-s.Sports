import { clubesBrasileiros, clubesInternacionais, selecoes } from "@/data/teams";

export const mainNav = [
  { href: "/", label: "Início" },
  { href: "/clubes", label: "Clubes", mega: "clubes" as const },
  { href: "/selecoes", label: "Seleções", mega: "selecoes" as const },
  { href: "/retro", label: "Retrô" },
  { href: "/lancamentos", label: "Lançamentos" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/como-comprar", label: "Como comprar" },
];

export const megaClubes = {
  brasil: clubesBrasileiros.map((t) => ({
    href: `/clubes/${t.slug}`,
    label: t.name,
  })),
  europa: clubesInternacionais.map((t) => ({
    href: `/clubes/${t.slug}`,
    label: t.name,
  })),
};

export const megaSelecoes = selecoes.map((t) => ({
  href: `/selecoes/${t.slug}`,
  label: t.name,
}));
