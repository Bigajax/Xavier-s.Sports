import type { Filters } from "@/lib/catalog";

/** Categorias principais da home e do catálogo — editáveis. */
export type Category = {
  slug: string;
  name: string;
  description: string;
  filters: Filters;
  /** produto cuja foto ilustra o card (slug em data/products.ts) */
  coverProduct?: string;
};

export const categories: Category[] = [
  {
    slug: "clubes-brasileiros",
    name: "Clubes brasileiros",
    description: "Do Brasileirão para o seu guarda-roupa.",
    filters: { teamType: "clube", country: "Brasil" },
    coverProduct: "camisa-corinthians-home-2025-jogador",
  },
  {
    slug: "clubes-internacionais",
    name: "Clubes internacionais",
    description: "Gigantes da Europa e do mundo.",
    filters: { teamType: "clube" },
    coverProduct: "camisa-barcelona-retro-1996",
  },
  {
    slug: "selecoes",
    name: "Seleções",
    description: "Vista as cores do seu país.",
    filters: { teamType: "selecao" },
    coverProduct: "camisa-portugal-home-2025",
  },
  {
    slug: "retro",
    name: "Retrô",
    description: "Modelos que marcaram época.",
    filters: { collection: "retro" },
    coverProduct: "camisa-barcelona-retro-1996",
  },
  {
    slug: "femininas",
    name: "Femininas",
    description: "Cortes pensados para elas.",
    filters: { audience: "feminino" },
    coverProduct: "camisa-brasil-home-feminina",
  },
  {
    slug: "infantis",
    name: "Infantis",
    description: "Para a torcida que está crescendo.",
    filters: { audience: "infantil" },
    coverProduct: "kit-infantil-brasil-home",
  },
  {
    slug: "treino",
    name: "Camisas de treino",
    description: "Conforto para treinar e torcer.",
    filters: { version: "treino" },
    coverProduct: "camisa-flamengo-treino-2025",
  },
  {
    slug: "ofertas",
    name: "Ofertas",
    description: "Modelos selecionados com preço especial.",
    filters: { onlyOnSale: true },
    coverProduct: "camisa-corinthians-edicao-especial-off-white",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
