/**
 * Tipos do catálogo lido do Supabase. Cada produto tem variações por tamanho
 * com estoque numérico; o status (pronta entrega / sob encomenda / esgotado)
 * é sempre derivado das variações, nunca editado manualmente.
 */

export type Variant = {
  id: string;
  label: string;
  stock: number;
  allowPreOrder: boolean;
  estimatedDelivery?: string;
  active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  team: string;
  teamSlug: string;
  teamType: "clube" | "selecao";
  country: string;
  league?: string;
  season?: string;
  collection: "atual" | "retro";
  version: "torcedor" | "jogador" | "treino" | "pre-jogo" | "goleiro" | "retro";
  audience: "masculino" | "feminino" | "infantil" | "unissex";
  sleeve: "curta" | "longa";
  description: string;
  price: number;
  oldPrice?: number;
  installments?: number;
  images: string[];
  video?: string;
  colors: string[];
  variants: Variant[];
  personalizationAvailable: boolean;
  personalizationPrice?: number;
  sku: string;
  material?: string;
  careInstructions?: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  onSale: boolean;
  available: boolean;
  tags: string[];
  /** Arquivado: fora da vitrine e da listagem padrão do painel. */
  archivedAt?: string | null;
  /** Limite de "estoque baixo" deste produto; sem valor usa o global. */
  lowStockThreshold?: number | null;
};

// ---------- Disponibilidade ----------

export type ProductStatus = "pronta-entrega" | "sob-encomenda" | "esgotado";

/** Estoque igual ou abaixo disso mostra "Últimas N unidades". */
export const LOW_STOCK_THRESHOLD = 2;

/** Limite efetivo de estoque baixo: o do produto, ou o global. */
export function effectiveLowStock(p: Product): number {
  return p.lowStockThreshold ?? LOW_STOCK_THRESHOLD;
}

export const statusLabel: Record<ProductStatus, string> = {
  "pronta-entrega": "Pronta entrega",
  "sob-encomenda": "Sob encomenda",
  esgotado: "Esgotado",
};

export function deriveStatus(variants: Variant[]): ProductStatus {
  const active = variants.filter((v) => v.active);
  if (active.some((v) => v.stock > 0)) return "pronta-entrega";
  if (active.some((v) => v.allowPreOrder)) return "sob-encomenda";
  return "esgotado";
}

export type VariantAvailability =
  | { kind: "pronta-entrega"; stock: number; low: boolean }
  | { kind: "encomenda"; estimatedDelivery?: string }
  | { kind: "indisponivel" };

export function variantAvailability(v: Variant): VariantAvailability {
  if (!v.active) return { kind: "indisponivel" };
  if (v.stock > 0)
    return {
      kind: "pronta-entrega",
      stock: v.stock,
      low: v.stock <= LOW_STOCK_THRESHOLD,
    };
  if (v.allowPreOrder)
    return { kind: "encomenda", estimatedDelivery: v.estimatedDelivery };
  return { kind: "indisponivel" };
}

/** Variantes que o cliente pode pedir (estoque ou encomenda). */
export function purchasableVariants(p: Product): Variant[] {
  return p.variants.filter(
    (v) => variantAvailability(v).kind !== "indisponivel"
  );
}

export type AvailabilitySummary = {
  kind: ProductStatus;
  /** Texto pronto para o card, ex.: "P, M e G a pronta entrega". */
  text: string;
  /** Prazo da encomenda, só quando todos os tamanhos compartilham o mesmo. */
  detail?: string;
};

/**
 * Resumo de disponibilidade específico para cards e listas: quais tamanhos
 * saem agora, ou se o produto é encomenda/esgotado.
 */
export function availabilitySummary(p: Product): AvailabilitySummary {
  const inStock = p.variants.filter((v) => v.active && v.stock > 0);
  if (inStock.length === 1) {
    return {
      kind: "pronta-entrega",
      text: `Tamanho ${inStock[0].label} a pronta entrega`,
    };
  }
  if (inStock.length > 0 && inStock.length <= 3) {
    const labels = inStock.map((v) => v.label);
    const list = `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
    return { kind: "pronta-entrega", text: `${list} a pronta entrega` };
  }
  if (inStock.length > 3) {
    return {
      kind: "pronta-entrega",
      text: `${inStock.length} tamanhos a pronta entrega`,
    };
  }
  const preOrder = p.variants.filter((v) => v.active && v.allowPreOrder);
  if (preOrder.length > 0) {
    const deliveries = new Set(preOrder.map((v) => v.estimatedDelivery));
    const shared = deliveries.size === 1 ? preOrder[0].estimatedDelivery : undefined;
    return { kind: "sob-encomenda", text: "Por encomenda", detail: shared };
  }
  return { kind: "esgotado", text: "Esgotado — consulte reposição" };
}

/**
 * Rótulo de status para o painel: mais preciso que a vitrine, distinguindo
 * "pronta entrega + encomenda" e contando os tamanhos disponíveis.
 */
export function adminStatusLabel(p: Product): string {
  const active = p.variants.filter((v) => v.active);
  const inStock = active.filter((v) => v.stock > 0);
  const preOrderEmpty = active.filter((v) => v.stock === 0 && v.allowPreOrder);
  if (inStock.length > 0 && preOrderEmpty.length > 0) {
    return "Pronta entrega + encomenda";
  }
  if (inStock.length > 0) {
    return inStock.length === 1
      ? "Pronta entrega em 1 tamanho"
      : `Pronta entrega em ${inStock.length} tamanhos`;
  }
  if (preOrderEmpty.length > 0) return "Somente encomenda";
  return "Esgotado";
}

// ---------- Helpers de consulta (recebem a lista, não importam mais o array) ----------

export function findProduct(all: Product[], slug: string): Product | undefined {
  return all.find((p) => p.slug === slug);
}

export function productsByTeam(all: Product[], teamSlug: string): Product[] {
  return all.filter((p) => p.teamSlug === teamSlug);
}

export function related(product: Product, all: Product[], limit = 4): Product[] {
  const pool = all.filter((p) => p.slug !== product.slug);
  const score = (p: Product) =>
    (p.teamSlug === product.teamSlug ? 4 : 0) +
    (p.league === product.league ? 2 : 0) +
    (p.collection === product.collection ? 1 : 0) +
    (p.season === product.season ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export const newArrivals = (all: Product[]) => all.filter((p) => p.newArrival);
export const bestSellers = (all: Product[]) => all.filter((p) => p.bestSeller);
export const onSaleProducts = (all: Product[]) => all.filter((p) => p.onSale);
export const retroProducts = (all: Product[]) =>
  all.filter((p) => p.collection === "retro");
