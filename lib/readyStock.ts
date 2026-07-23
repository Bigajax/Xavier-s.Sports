/**
 * FONTE ÚNICA de estoque à pronta entrega da Xavier's Sports.
 *
 * O estoque do site vem daqui — não do estoque numérico do Supabase (que hoje
 * é dado de seed, 10 por tamanho em todo produto). Ao carregar o catálogo,
 * `applyReadyStock` reescreve as variantes de cada produto com estes números:
 *   - tamanho listado abaixo (> 0) ....... pronta entrega, com a quantidade real;
 *   - qualquer outro tamanho/produto ..... por encomenda (prazo de 7 a 12 dias).
 *
 * Assim toda a vitrine (cards, seletor de tamanho, WhatsApp, sacola) reflete o
 * estoque real com viés seguro: sem correspondência explícita aqui, o site
 * nunca promete pronta entrega — cai para encomenda.
 *
 * Para alterar o estoque, edite SOMENTE este arquivo. A lista foi informada
 * pelo cliente: 29 modelos, 89 unidades (validado em runtime abaixo).
 */

export type ReadyStockGroup = "Clubes" | "Seleções";

export type ReadyStockEntry = {
  /** Nome informal do modelo, como o cliente enviou. */
  name: string;
  group: ReadyStockGroup;
  /** Unidades por tamanho. Só tamanhos com estoque entram aqui. */
  stockBySize: Record<string, number>;
  /**
   * Slug do produto no catálogo, quando há correspondência CLARA (time, ano,
   * cor, versão, gênero, manga). `null` = sem correspondência confiável: o
   * modelo fica registrado aqui (conta no total), mas não aparece na vitrine
   * até ganhar um produto/imagem próprios. Nunca associamos "por aproximação".
   */
  slug: string | null;
  /** Observação de divergência quando o match exigiu uma escolha. */
  note?: string;
};

/** Prazo padrão dos produtos por encomenda. */
export const PRE_ORDER_DELIVERY = "7 a 12 dias úteis";

export const READY_STOCK: ReadyStockEntry[] = [
  // ---------------- Seleções ----------------
  {
    name: "Brasil Torcedor amarela",
    group: "Seleções",
    stockBySize: { P: 6, M: 2, G: 8, GG: 8, "2XL": 2 },
    slug: "camisa-brasil-home-2026-torcedor",
    note: "Ano não informado; há home torcedor amarela 2025 e 2026 — associada à 2026 (atual). Confirmar com o dono.",
  },
  {
    name: "Brasil Player amarela",
    group: "Seleções",
    stockBySize: { G: 7 },
    slug: "camisa-brasil-home-2026-jogador",
  },
  {
    name: "Brasil feminina amarela",
    group: "Seleções",
    stockBySize: { M: 9 },
    slug: "camisa-brasil-home-feminina",
  },
  {
    name: "Argentina Player 2026",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-argentina-home-2026-jogador",
    note: "Home/Away não informado — associada ao Home (celeste). Confirmar.",
  },
  {
    name: "Argentina manga longa Fan",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-argentina-home-2026-manga-longa",
    note: "Fotos do fornecedor (Argentina 2026 Home Long-Sleeve, torcedor).",
  },
  {
    name: "Alemanha Fan manga longa",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-alemanha-home-2026-manga-longa",
    note: "Fotos do fornecedor (Germany 2026 Home Long-Sleeve, torcedor).",
  },
  {
    name: "Espanha 2026 Fan vermelha",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-espanha-home-2026-torcedor",
  },
  {
    name: "Espanha 2026 Player vermelha",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-espanha-home-2026-jogador",
  },
  {
    name: "Portugal 2026 vermelha",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-portugal-home-2026-jogador",
    note: "Versão não informada; home 2026 existe só como Jogador (R$249). Confirmar se é Torcedor.",
  },
  {
    name: "Brasil 1998 amarela",
    group: "Seleções",
    stockBySize: { G: 1 },
    slug: "camisa-retro-brasil-1998-home",
    note: "Fotos do fornecedor (Retro Brazil 1998 home, amarela).",
  },
  // ---------------- Clubes ----------------
  {
    name: "São Paulo 2026 Fan listrada",
    group: "Clubes",
    stockBySize: { G: 4 },
    slug: "camisa-sao-paulo-away-2025",
    note: "Listrada (tricolor) = away torcedor; catálogo tem 2025 (não há away torcedor 2026). Confirmar ano.",
  },
  {
    name: "São Paulo 2026 Fan branca",
    group: "Clubes",
    stockBySize: { M: 4 },
    slug: "camisa-sao-paulo-home-26-27-torcedor",
    note: "Branca = home torcedor 26/27 (≈2026).",
  },
  {
    name: "São Paulo 2026 Fan preta",
    group: "Clubes",
    stockBySize: { M: 2 },
    slug: "camisa-sao-paulo-preta",
    note: "Fotos do fornecedor (São Paulo preta edição especial, SPFC/SUPERBET).",
  },
  {
    name: "Flamengo 2025 preta vermelha",
    group: "Clubes",
    stockBySize: { GG: 1 },
    slug: "camisa-flamengo-home-2025",
  },
  {
    name: "Flamengo 2026 Fan preta vermelho",
    group: "Clubes",
    stockBySize: { G: 1 },
    slug: "camisa-flamengo-home-26-27-torcedor",
    note: "Home torcedor 26/27 (≈2026), vermelho/preto.",
  },
  {
    name: "Flamengo bege 2024",
    group: "Clubes",
    stockBySize: { "2XL": 1 },
    slug: "camisa-flamengo-bege",
    note: "Fotos do fornecedor (Flamengo bege/creme, monograma CRF grená).",
  },
  {
    name: "Atlético-MG 2026 Fan I listrada",
    group: "Clubes",
    stockBySize: { G: 2 },
    slug: "camisa-atletico-mineiro-home-26-27-torcedor",
    note: "Fotos do fornecedor (Atlético Mineiro 26/27 Home, listrada, torcedor).",
  },
  {
    name: "Palmeiras 2026 branca Fan",
    group: "Clubes",
    stockBySize: { P: 4, GG: 4 },
    slug: "camisa-palmeiras-away-26-27-torcedor",
    note: "Branca = away torcedor 26/27 (≈2026).",
  },
  {
    name: "Palmeiras 2026 verde Fan",
    group: "Clubes",
    stockBySize: { G: 1, "2XL": 1 },
    slug: "camisa-palmeiras-home-26-27-torcedor",
    note: "Verde = home torcedor 26/27 (≈2026).",
  },
  {
    name: "Palmeiras Woman amarela",
    group: "Clubes",
    stockBySize: { M: 2 },
    slug: "camisa-palmeiras-feminina-amarela",
    note: "Fotos do fornecedor (Palmeiras feminina amarela, edição especial).",
  },
  {
    name: "Palmeiras verde Woman 2025",
    group: "Clubes",
    stockBySize: { M: 1 },
    slug: "camisa-palmeiras-home-feminina",
    note: "Fotos do fornecedor (24/25 Women Palmeiras Home, verde).",
  },
  {
    name: "Santos 2025 Fan branca",
    group: "Clubes",
    stockBySize: { G: 2 },
    slug: "camisa-santos-home-2025",
  },
  {
    name: "Santos 2025 azul",
    group: "Clubes",
    stockBySize: { G: 1 },
    slug: "camisa-santos-retro-azul",
    note: "Único Santos azul é o retrô (celeste, ~2011); cliente indicou 2025. Confirmar.",
  },
  {
    name: "Corinthians 2026 Fan listrada",
    group: "Clubes",
    stockBySize: { G: 1 },
    slug: "camisa-corinthians-away-26-27-torcedor",
    note: "Listrada = away torcedor 26/27 (≈2026).",
  },
  {
    name: "Corinthians 2026 Fan branca",
    group: "Clubes",
    stockBySize: { G: 3 },
    slug: "camisa-corinthians-home-26-27-torcedor",
    note: "Branca = home torcedor 26/27 (≈2026).",
  },
  {
    name: "Corinthians 2025 preta com laranja",
    group: "Clubes",
    stockBySize: { G: 1, GG: 1 },
    slug: "camisa-corinthians-preta-laranja",
    note: "Fotos do fornecedor (Corinthians 25/26 Third Away, preta com laranja).",
  },
  {
    name: "Corinthians branca 2025 Fan",
    group: "Clubes",
    stockBySize: { G: 1 },
    slug: "camisa-corinthians-home-2025-torcedor",
  },
  {
    name: "Corinthians All Black Fan",
    group: "Clubes",
    stockBySize: { G: 1 },
    slug: "camisa-corinthians-all-black",
    note: "Fotos do fornecedor (Corinthians 22/23 away toda preta com dourado) — melhor correspondência de 'all black'; confirmar.",
  },
  {
    name: "Corinthians Fan treino 2026",
    group: "Clubes",
    stockBySize: { "4XL": 1 },
    slug: "camisa-corinthians-treino",
    note: "Fotos do fornecedor (Corinthians 26/27 treino grená). Cor não informada pelo cliente; confirmar.",
  },
];

// ---------- Validação (não quebra o build; alerta em dev) ----------

export function totalReadyUnits(entry: ReadyStockEntry): number {
  return Object.values(entry.stockBySize).reduce((a, b) => a + b, 0);
}

const MODEL_COUNT = READY_STOCK.length;
const UNIT_COUNT = READY_STOCK.reduce((sum, e) => sum + totalReadyUnits(e), 0);

if (process.env.NODE_ENV !== "production") {
  if (MODEL_COUNT !== 29 || UNIT_COUNT !== 89) {
    // eslint-disable-next-line no-console
    console.warn(
      `[readyStock] Esperado 29 modelos / 89 unidades — encontrado ${MODEL_COUNT} / ${UNIT_COUNT}.`
    );
  }
  const dupSlugs = READY_STOCK.map((e) => e.slug).filter(
    (s, i, arr): s is string => !!s && arr.indexOf(s) !== i
  );
  if (dupSlugs.length) {
    // eslint-disable-next-line no-console
    console.warn(`[readyStock] Slugs repetidos no mapeamento: ${dupSlugs.join(", ")}`);
  }
}

/** Mapa slug -> estoque por tamanho, só dos modelos com correspondência. */
const bySlug = new Map<string, Record<string, number>>();
for (const e of READY_STOCK) {
  if (e.slug) bySlug.set(e.slug, e.stockBySize);
}

// ---------- Aplicação sobre o catálogo ----------

// Tipo estrutural mínimo: evita import circular com lib/products/types.
type VariantLike = {
  label: string;
  stock: number;
  allowPreOrder: boolean;
  estimatedDelivery?: string;
  active: boolean;
};
type ProductLike = { slug: string; variants: VariantLike[] };

/**
 * Reescreve as variantes de um produto com o estoque real de pronta entrega.
 * Todo tamanho vira encomendável (prazo padrão); os tamanhos listados no
 * READY_STOCK recebem sua quantidade e passam a sair como pronta entrega.
 */
export function applyReadyStock<T extends ProductLike>(product: T): T {
  const stock = bySlug.get(product.slug);
  return {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      active: true,
      stock: stock?.[v.label] ?? 0,
      allowPreOrder: true,
      estimatedDelivery: PRE_ORDER_DELIVERY,
    })),
  };
}

// ---------- Helpers de apresentação ----------

/** Indicação de estoque no front (o número real fica interno na variante). */
export function stockLabel(units: number): string {
  if (units <= 0) return "Sob encomenda";
  if (units === 1) return "Última unidade";
  if (units <= 4) return "Poucas unidades";
  return "Em estoque";
}

/** Total de unidades à pronta entrega de um produto já transformado. */
export function readyUnits(product: { variants: { stock: number; active: boolean }[] }): number {
  return product.variants.reduce((n, v) => n + (v.active && v.stock > 0 ? v.stock : 0), 0);
}

/** Tamanhos à pronta entrega (com estoque), na ordem das variantes. */
export function readySizes(product: {
  variants: { label: string; stock: number; active: boolean }[];
}): string[] {
  return product.variants.filter((v) => v.active && v.stock > 0).map((v) => v.label);
}
