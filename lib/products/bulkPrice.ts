/**
 * Regras do ajuste de preço em lote — puras, sem banco e sem React.
 *
 * O mesmo cálculo roda nos dois lados: o painel usa para mostrar a prévia
 * ("105 produtos mudam, 2 em oferta são pulados") e a Server Action usa para
 * aplicar, recalculando a partir do banco. Assim a prévia nunca promete uma
 * coisa e a gravação faz outra.
 */

export type BulkPriceMode = "fixo" | "percentual";

/** Campos que o cálculo precisa — serve tanto para Product quanto para linha do banco. */
export type PriceablePart = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  onSale: boolean;
};

export type PriceChange = {
  id: string;
  name: string;
  from: number;
  to: number;
  /**
   * O preço "de" ficou menor ou igual ao novo preço — vira desconto de mentira,
   * então é limpo junto.
   */
  clearOldPrice: boolean;
};

export type BulkPricePlan = {
  changes: PriceChange[];
  /** Em oferta ativa: pulados para não apagar uma promoção no meio. */
  skippedOnSale: PriceablePart[];
  /** Já estavam no preço pedido. */
  unchanged: number;
  /** Preço inválido (zero, negativo ou fora do teto). */
  invalid: PriceablePart[];
};

/** Teto de segurança: acima disso é quase certo erro de digitação. */
export const MAX_PRICE = 99_999;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Preço final de um produto sob o ajuste pedido. */
export function targetPrice(
  current: number,
  mode: BulkPriceMode,
  value: number
): number {
  return mode === "fixo" ? round2(value) : round2(current * (1 + value / 100));
}

/**
 * Monta o plano do ajuste. `value` é o preço em reais (modo fixo) ou a variação
 * percentual (modo percentual, ex.: 10 para +10%, -5 para -5%).
 */
export function planBulkPrice(
  products: PriceablePart[],
  mode: BulkPriceMode,
  value: number
): BulkPricePlan {
  const plan: BulkPricePlan = {
    changes: [],
    skippedOnSale: [],
    unchanged: 0,
    invalid: [],
  };

  for (const p of products) {
    if (p.onSale) {
      plan.skippedOnSale.push(p);
      continue;
    }
    const to = targetPrice(p.price, mode, value);
    if (!Number.isFinite(to) || to <= 0 || to > MAX_PRICE) {
      plan.invalid.push(p);
      continue;
    }
    if (to === p.price) {
      plan.unchanged++;
      continue;
    }
    plan.changes.push({
      id: p.id,
      name: p.name,
      from: p.price,
      to,
      clearOldPrice: p.oldPrice !== undefined && p.oldPrice <= to,
    });
  }

  return plan;
}

/**
 * Agrupa as alterações por (preço final + limpar preço "de"), para gravar em
 * poucos UPDATEs em vez de um por produto — 265 produtos costumam virar 1 a 4
 * grupos, porque o catálogo trabalha com preços de tabela.
 */
export function groupChanges(
  changes: PriceChange[]
): { price: number; clearOldPrice: boolean; ids: string[] }[] {
  const groups = new Map<string, { price: number; clearOldPrice: boolean; ids: string[] }>();
  for (const c of changes) {
    const key = `${c.to}|${c.clearOldPrice}`;
    const group = groups.get(key) ?? {
      price: c.to,
      clearOldPrice: c.clearOldPrice,
      ids: [],
    };
    group.ids.push(c.id);
    groups.set(key, group);
  }
  return [...groups.values()];
}
