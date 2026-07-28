/**
 * Faixas de preço do catálogo — o agrupamento que o dono usa para reprecificar.
 *
 * Espelha a regra de config/catalogo.ts: manga longa tem preço próprio,
 * independente da versão; o resto segue a versão. Uma faixa só aparece no
 * painel se existir produto nela.
 */

import type { Product } from "@/lib/products/types";

export type PriceBandKey = "manga-longa" | Product["version"];

export const bandLabels: Record<PriceBandKey, string> = {
  "manga-longa": "Manga longa (todas as versões)",
  torcedor: "Torcedor (manga curta)",
  jogador: "Jogador (manga curta)",
  retro: "Retrô (manga curta)",
  treino: "Treino (manga curta)",
  "pre-jogo": "Pré-jogo (manga curta)",
  goleiro: "Goleiro (manga curta)",
};

/** Ordem de exibição — as faixas com mais produtos primeiro. */
const bandOrder: PriceBandKey[] = [
  "torcedor",
  "jogador",
  "retro",
  "manga-longa",
  "treino",
  "pre-jogo",
  "goleiro",
];

export function bandOf(p: Pick<Product, "sleeve" | "version">): PriceBandKey {
  return p.sleeve === "longa" ? "manga-longa" : p.version;
}

export type PriceBand = {
  key: PriceBandKey;
  label: string;
  products: Product[];
  /** Preços distintos hoje na faixa, do menor para o maior. */
  prices: number[];
  /**
   * Preço praticado pela maioria da faixa — é o "padrão" que um produto novo
   * deveria seguir. `null` quando não há maioria clara (empate), porque aí
   * apontar um deles como certo seria chute.
   */
  referencePrice: number | null;
  /** Produtos que fogem do preço de referência — o que entrou torto. */
  outliers: Product[];
  /** Produtos em oferta: o ajuste em lote não encosta neles. */
  onSaleCount: number;
};

/**
 * Preço da maioria. Ofertas ficam de fora da conta: um preço promocional não
 * define o padrão da faixa. Empate devolve `null`.
 */
function referenceOf(list: Product[]): number | null {
  const base = list.filter((p) => !p.onSale);
  if (base.length === 0) return null;

  const count = new Map<number, number>();
  for (const p of base) count.set(p.price, (count.get(p.price) ?? 0) + 1);

  const ranked = [...count.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0];
}

/**
 * Agrupa o catálogo em faixas. Arquivados ficam de fora: estão fora da loja e
 * só poluiriam a contagem.
 */
export function priceBands(products: Product[]): PriceBand[] {
  const byKey = new Map<PriceBandKey, Product[]>();
  for (const p of products) {
    if (p.archivedAt) continue;
    const key = bandOf(p);
    byKey.set(key, [...(byKey.get(key) ?? []), p]);
  }

  return bandOrder
    .filter((key) => byKey.has(key))
    .map((key) => {
      const list = byKey.get(key)!;
      const reference = referenceOf(list);
      return {
        key,
        label: bandLabels[key],
        products: list,
        prices: [...new Set(list.map((p) => p.price))].sort((a, b) => a - b),
        referencePrice: reference,
        outliers:
          reference === null
            ? []
            : list.filter((p) => !p.onSale && p.price !== reference),
        onSaleCount: list.filter((p) => p.onSale).length,
      };
    });
}

/**
 * Preço padrão sugerido para um produto novo, lido do próprio catálogo — não de
 * uma tabela fixa. Se a faixa ainda não existe (primeira camisa daquele tipo),
 * devolve `null` e o cadastro segue livre.
 */
export function suggestedPrice(
  catalog: Product[],
  part: Pick<Product, "sleeve" | "version">
): number | null {
  const key = bandOf(part);
  return priceBands(catalog).find((b) => b.key === key)?.referencePrice ?? null;
}
