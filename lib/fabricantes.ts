import type { Product } from "@/lib/products/types";

/**
 * OS FABRICANTES (14/10/2026), para a faixa "Escolha pela marca" da home e o
 * filtro `?marca=` do catálogo.
 *
 * O catálogo não guarda o fabricante: nem coluna, nem nome, nem tag. Esta
 * tabela liga o TIME ao fabricante do uniforme ATUAL, e só vale para a
 * coleção "atual" (as retrô são de épocas e fabricantes diferentes e ficam
 * fora). Entraram só os times com fabricante conhecido nas temporadas 25/26,
 * 26/27 e Copa 2026.
 *
 * ⚠️ A CONFERIR COM O FELLYPE antes de publicar. Ficaram de fora de
 * propósito: Napoli (EA7), Leverkusen e Athletic Bilbao (Castore) e Uruguai
 * (troca recente de fabricante). A camisa 2 do Brasil para a Copa 2026 é
 * Jordan, não Nike: a tabela é por time e põe o Brasil inteiro na Nike.
 *
 * REGRA DO MOLDE: na faixa só entra marca com a LOGO OFICIAL em arquivo
 * (public/images/marcas/), nunca o nome escrito. Umbro (Santos, Fluminense,
 * Grêmio) e Kappa (Vasco) estão na tabela, mas só aparecem na faixa quando a
 * logo deles chegar.
 */
export type Fabricante = { slug: string; nome: string; logo: string | null };

export const FABRICANTES: Fabricante[] = [
  { slug: "adidas", nome: "Adidas", logo: "/images/marcas/adidas.svg" },
  { slug: "nike", nome: "Nike", logo: "/images/marcas/nike.svg" },
  { slug: "puma", nome: "Puma", logo: "/images/marcas/puma.svg" },
  { slug: "new-balance", nome: "New Balance", logo: "/images/marcas/newbalance.svg" },
  { slug: "reebok", nome: "Reebok", logo: "/images/marcas/reebok.svg" },
  { slug: "umbro", nome: "Umbro", logo: null },
  { slug: "kappa", nome: "Kappa", logo: null },
];

const POR_TIME: Record<string, string> = {
  // Brasil
  corinthians: "nike",
  palmeiras: "puma",
  flamengo: "adidas",
  "sao-paulo": "new-balance",
  santos: "umbro",
  fluminense: "umbro",
  gremio: "umbro",
  internacional: "adidas",
  cruzeiro: "adidas",
  "atletico-mineiro": "adidas",
  bahia: "puma",
  vasco: "kappa",
  botafogo: "reebok",
  // Europa e EUA
  arsenal: "adidas",
  "real-madrid": "adidas",
  bayern: "adidas",
  "manchester-united": "adidas",
  newcastle: "adidas",
  "inter-miami": "adidas",
  barcelona: "nike",
  psg: "nike",
  chelsea: "nike",
  tottenham: "nike",
  inter: "nike",
  "atletico-madrid": "nike",
  milan: "puma",
  "manchester-city": "puma",
  "borussia-dortmund": "puma",
  marseille: "puma",
  // Seleções (Copa 2026)
  brasil: "nike",
  franca: "nike",
  holanda: "nike",
  inglaterra: "nike",
  argentina: "adidas",
  alemanha: "adidas",
  espanha: "adidas",
  italia: "adidas",
  mexico: "adidas",
  japao: "adidas",
  portugal: "puma",
};

/** o fabricante da camisa, ou null (retrô e times fora da tabela) */
export function fabricanteDe(p: Pick<Product, "teamSlug" | "collection">): string | null {
  if (p.collection !== "atual") return null;
  return POR_TIME[p.teamSlug] ?? null;
}

export function acharFabricante(slug: string): Fabricante | undefined {
  return FABRICANTES.find((f) => f.slug === slug);
}

/** os fabricantes com logo e com camisa no catálogo, do que tem mais para o que tem menos */
export function fabricantesDaFaixa(catalogo: Pick<Product, "teamSlug" | "collection">[]): (Fabricante & { logo: string; total: number })[] {
  const total = new Map<string, number>();
  for (const p of catalogo) {
    const f = fabricanteDe(p);
    if (f) total.set(f, (total.get(f) ?? 0) + 1);
  }
  return FABRICANTES.filter((f): f is Fabricante & { logo: string } => Boolean(f.logo) && (total.get(f.slug) ?? 0) > 0)
    .map((f) => ({ ...f, total: total.get(f.slug) ?? 0 }))
    .sort((a, b) => b.total - a.total);
}
