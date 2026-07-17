import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import type { Product, Variant } from "@/lib/products/types";

/**
 * Leitura do catálogo no Supabase, cacheada com a tag "products".
 * As Server Actions do admin chamam revalidateTag("products") ao salvar,
 * então a vitrine reflete alterações imediatamente; o revalidate de 5 min
 * é só uma rede de segurança.
 *
 * Importante: usa o cliente anon puro (sem cookies) — um cliente com
 * cookies tornaria as rotas dinâmicas e quebraria o unstable_cache.
 */

export const PRODUCTS_TAG = "products";

function anonClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env.local e preencha com os dados do projeto Supabase."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

type VariantRow = {
  id: string;
  label: string;
  stock: number;
  allow_pre_order: boolean;
  estimated_delivery: string | null;
  active: boolean;
  position: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  team: string;
  team_slug: string;
  team_type: Product["teamType"];
  country: string;
  league: string | null;
  season: string | null;
  collection: Product["collection"];
  version: Product["version"];
  audience: Product["audience"];
  sleeve: Product["sleeve"];
  description: string;
  price: number | string;
  old_price: number | string | null;
  installments: number | null;
  images: string[];
  video: string | null;
  colors: string[];
  personalization_available: boolean;
  personalization_price: number | string | null;
  sku: string;
  material: string | null;
  care_instructions: string[] | null;
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
  on_sale: boolean;
  available: boolean;
  tags: string[];
  archived_at?: string | null;
  low_stock_threshold?: number | null;
  product_variants: VariantRow[];
};

function mapVariant(row: VariantRow): Variant {
  return {
    id: row.id,
    label: row.label,
    stock: row.stock,
    allowPreOrder: row.allow_pre_order,
    estimatedDelivery: row.estimated_delivery ?? undefined,
    active: row.active,
  };
}

/** Converte a linha do banco para o tipo do app. `numeric` chega como string. */
export function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    team: row.team,
    teamSlug: row.team_slug,
    teamType: row.team_type,
    country: row.country,
    league: row.league ?? undefined,
    season: row.season ?? undefined,
    collection: row.collection,
    version: row.version,
    audience: row.audience,
    sleeve: row.sleeve,
    description: row.description,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    installments: row.installments ?? undefined,
    images: row.images ?? [],
    video: row.video ?? undefined,
    colors: row.colors ?? [],
    variants: [...(row.product_variants ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(mapVariant),
    personalizationAvailable: row.personalization_available,
    personalizationPrice:
      row.personalization_price != null
        ? Number(row.personalization_price)
        : undefined,
    sku: row.sku,
    material: row.material ?? undefined,
    careInstructions: row.care_instructions ?? undefined,
    featured: row.featured,
    newArrival: row.new_arrival,
    bestSeller: row.best_seller,
    onSale: row.on_sale,
    available: row.available,
    tags: row.tags ?? [],
    archivedAt: row.archived_at ?? null,
    lowStockThreshold: row.low_stock_threshold ?? null,
  };
}

async function fetchCatalog(): Promise<Product[]> {
  const { data, error } = await anonClient()
    .from("products")
    .select("*, product_variants(*)")
    .eq("available", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar o catálogo: ${error.message}`);
  // Arquivados nunca aparecem na vitrine (filtro em memória para funcionar
  // antes e depois da migration que cria a coluna archived_at).
  return (data as ProductRow[]).map(mapRow).filter((p) => !p.archivedAt);
}

/** Catálogo completo visível na vitrine (available = true). */
export const getCatalog = unstable_cache(fetchCatalog, ["catalog"], {
  tags: [PRODUCTS_TAG],
  revalidate: 300,
});

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}

/**
 * Catálogo completo para o admin — sem cache e incluindo produtos ocultos.
 * Usar em páginas com `export const dynamic = "force-dynamic"`.
 */
export async function getAdminCatalog(): Promise<Product[]> {
  const { data, error } = await anonClient()
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Erro ao carregar o catálogo: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}
