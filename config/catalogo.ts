/**
 * FONTE ÚNICA de preço padrão e prazo de encomenda da Xavier's Sports.
 *
 * Tudo que fala de preço padrão ou de prazo — vitrine, página do produto,
 * sacola, mensagem do WhatsApp, painel e scripts de manutenção — lê daqui.
 * Alterar o prazo é alterar UMA linha deste arquivo; nenhuma página tem texto
 * de prazo escrito à mão.
 *
 * O prazo de encomenda é derivado, não editável por produto: `lib/products/db.ts`
 * reescreve `estimatedDelivery` de toda variante encomendável com o valor daqui
 * ao ler o catálogo, então banco desatualizado nunca vaza para o site.
 */

import type { Product } from "@/lib/products/types";

// ---------- Prazo de encomenda ----------

/**
 * Prazo cru, para encaixar depois de um rótulo:
 * "Prazo de 15 a 25 dias úteis.", "Sob encomenda · 15 a 25 dias úteis".
 */
export const PRE_ORDER_DELIVERY_RANGE = "15 a 25 dias úteis";

/** Frase completa, para quando o prazo aparece sozinho. */
export const PRE_ORDER_DELIVERY_TEXT = `Prazo de ${PRE_ORDER_DELIVERY_RANGE}.`;

// ---------- Preço padrão ----------

/** Manga longa tem preço único, acima da manga curta da mesma versão. */
export const LONG_SLEEVE_PRICE = 249.9;

/**
 * Preço padrão da manga curta, por versão. Versões fora desta lista
 * (treino, pré-jogo, goleiro) não têm preço de tabela: são precificadas caso a
 * caso no painel e os scripts de padronização não encostam nelas.
 *
 * ⚠️ O DIA A DIA DE PREÇO É NO PAINEL (/admin/produtos > "Preços em lote").
 * Esta tabela é a referência de cadastro (seeds e produtos novos) e só é
 * escrita no banco por `scripts/padroniza-precos.ts --aplicar`. Se você mudar
 * preço pelo painel, atualize os números aqui também — senão um `--aplicar`
 * futuro desfaz o que você fez.
 */
export const PRICE_BY_VERSION: Partial<Record<Product["version"], number>> = {
  torcedor: 189,
  jogador: 249,
  retro: 229,
};

/**
 * Preço de tabela de um produto — manga longa ignora a versão.
 * `undefined` = sem preço padrão, mantenha o que estiver cadastrado.
 */
export function standardPrice(
  p: Pick<Product, "sleeve" | "version">
): number | undefined {
  return p.sleeve === "longa" ? LONG_SLEEVE_PRICE : PRICE_BY_VERSION[p.version];
}
