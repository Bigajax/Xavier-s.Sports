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
};

// ---------- Disponibilidade ----------

export type ProductStatus = "pronta-entrega" | "sob-encomenda" | "esgotado";

/** Estoque igual ou abaixo disso mostra "Últimas N unidades". */
export const LOW_STOCK_THRESHOLD = 3;

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
