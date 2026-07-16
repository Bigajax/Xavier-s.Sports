import { variantAvailability, type Product } from "@/lib/products/types";

/** Normaliza para busca sem acento e caixa. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export type Filters = {
  q?: string;
  teamSlug?: string;
  teamType?: "clube" | "selecao";
  country?: string;
  league?: string;
  season?: string;
  collection?: "atual" | "retro";
  version?: string;
  audience?: string;
  sleeve?: "curta" | "longa";
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  onlyAvailable?: boolean;
  /** Somente produtos com ao menos um tamanho ativo em estoque. */
  onlyReadyToShip?: boolean;
  onlyPersonalizable?: boolean;
  onlyOnSale?: boolean;
  decade?: string; // "1990" | "2000" ...
};

export type SortKey =
  | "recentes"
  | "procuradas"
  | "menor-preco"
  | "maior-preco"
  | "nome"
  | "temporada";

export const sortLabels: Record<SortKey, string> = {
  recentes: "Mais recentes",
  procuradas: "Mais procuradas",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  nome: "Nome A–Z",
  temporada: "Temporada mais recente",
};

function matchesSearch(p: Product, q: string): boolean {
  const hay = norm(
    [
      p.name,
      p.team,
      p.season ?? "",
      p.version,
      p.sku,
      p.league ?? "",
      p.country,
      ...p.colors,
      ...p.tags,
    ].join(" ")
  );
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

function seasonYear(p: Product): number {
  const m = p.season?.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

export function applyFilters(list: Product[], f: Filters): Product[] {
  return list.filter((p) => {
    if (f.q && !matchesSearch(p, f.q)) return false;
    if (f.teamSlug && p.teamSlug !== f.teamSlug) return false;
    if (f.teamType && p.teamType !== f.teamType) return false;
    if (f.country && p.country !== f.country) return false;
    if (f.league && p.league !== f.league) return false;
    if (f.season && p.season !== f.season) return false;
    if (f.collection && p.collection !== f.collection) return false;
    if (f.version && p.version !== f.version) return false;
    if (f.audience && p.audience !== f.audience) return false;
    if (f.sleeve && p.sleeve !== f.sleeve) return false;
    if (
      f.size &&
      !p.variants.some(
        (v) =>
          v.label === f.size && variantAvailability(v).kind !== "indisponivel"
      )
    )
      return false;
    if (f.color && !p.colors.some((c) => norm(c) === norm(f.color!)))
      return false;
    if (f.priceMin !== undefined && p.price < f.priceMin) return false;
    if (f.priceMax !== undefined && p.price > f.priceMax) return false;
    if (f.onlyAvailable && !p.available) return false;
    if (
      f.onlyReadyToShip &&
      !p.variants.some((v) => v.active && v.stock > 0)
    )
      return false;
    if (f.onlyPersonalizable && !p.personalizationAvailable) return false;
    if (f.onlyOnSale && !p.onSale) return false;
    if (f.decade) {
      const y = seasonYear(p);
      const d = parseInt(f.decade, 10);
      if (!(p.collection === "retro" && y >= d && y < d + 10)) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case "recentes":
      return arr.sort(
        (a, b) => Number(b.newArrival) - Number(a.newArrival) || seasonYear(b) - seasonYear(a)
      );
    case "procuradas":
      return arr.sort(
        (a, b) =>
          Number(b.bestSeller) - Number(a.bestSeller) ||
          Number(b.featured) - Number(a.featured)
      );
    case "menor-preco":
      return arr.sort((a, b) => a.price - b.price);
    case "maior-preco":
      return arr.sort((a, b) => b.price - a.price);
    case "nome":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "temporada":
      return arr.sort((a, b) => seasonYear(b) - seasonYear(a));
  }
}

/** Valores únicos para montar as opções de filtro. */
export function facets(list: Product[]) {
  const uniq = (arr: (string | undefined)[]) =>
    [...new Set(arr.filter(Boolean) as string[])];
  return {
    seasons: uniq(list.map((p) => p.season)).sort().reverse(),
    versions: uniq(list.map((p) => p.version)),
    audiences: uniq(list.map((p) => p.audience)),
    colors: uniq(list.flatMap((p) => p.colors)),
    sizes: uniq(list.flatMap((p) => p.variants.map((v) => v.label))),
    countries: uniq(list.map((p) => p.country)),
  };
}
