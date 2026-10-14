import type { Product } from "@/lib/products/types";
import { PRE_ORDER_DELIVERY_RANGE } from "@/config/catalogo";

/**
 * A DESCRIÇÃO DA PÁGINA DA PEÇA (14/10/2026, pedido do Rafael: "adicionar
 * descrição com copy persuasiva").
 *
 * As 259 descrições do banco vieram dos scripts de cadastro e terminam quase
 * todas com o mesmo recado ("Fotos reais do produto — fale com a equipe pelo
 * WhatsApp para confirmar disponibilidade."), com travessão e repetindo o que
 * a página já diz. Aqui a descrição é montada dos campos da peça: um gancho
 * pela coleção, a frase da peça (sem o recado) e os motivos de compra. Nada
 * inventado: versão, temporada, personalização, prazo e parcelamento saem do
 * cadastro e de config/catalogo.ts. A descrição do banco segue editável no
 * painel e continua sendo a frase do meio.
 */

const RECADO = /\s*Fotos reais do produto[^.]*\.?\s*/gi;

/** a frase do banco, sem o recado de cadastro e sem travessão */
export function fraseDaPeca(p: Pick<Product, "description">): string {
  return (p.description ?? "")
    .replace(RECADO, " ")
    .replace(/\s+—\s+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

/** o gancho: por que essa camisa, pela coleção */
export function ganchoDaPeca(p: Pick<Product, "team" | "season" | "collection" | "teamType">): string {
  const temporada = p.season ? ` ${p.season}` : "";
  if (p.collection === "retro")
    return `Uma camisa de coleção: o ${p.team}${temporada}, para quem viveu aquela temporada e para quem quer vestir a história.`;
  if (p.teamType === "selecao")
    return /2026/.test(p.season ?? "")
      ? `A camisa para torcer pelo ${p.team} na Copa de 2026, do primeiro jogo até a final.`
      : `A camisa para torcer pelo ${p.team}, no estádio, no bar ou no sofá.`;
  return `O manto do ${p.team}${temporada}, para o estádio, para a rua e para o dia de jogo.`;
}

/** os motivos de compra, um por linha */
export function motivosDaPeca(
  p: Pick<Product, "version" | "personalizationAvailable" | "installments">,
  disponibilidade: "pronta-entrega" | "sob-encomenda" | "esgotado",
): string[] {
  const motivos: string[] = [];
  if (p.version === "jogador") motivos.push("Versão jogador: a modelagem ajustada, como a usada em campo.");
  else if (p.version === "torcedor") motivos.push("Versão torcedor: caimento confortável para o estádio e o dia a dia.");
  else if (p.version === "retro") motivos.push("Modelagem clássica, fiel à camisa da época.");
  if (disponibilidade === "pronta-entrega") motivos.push("Pronta entrega nos tamanhos sem o relógio; os outros saem por encomenda.");
  else if (disponibilidade === "sob-encomenda") motivos.push(`Por encomenda: prazo de ${PRE_ORDER_DELIVERY_RANGE}.`);
  if (p.personalizationAvailable) motivos.push("Aceita nome e número: a equipe confirma o valor no atendimento.");
  motivos.push(p.installments && p.installments >= 2 ? `Em até ${p.installments}x no cartão ou no Pix.` : "Pagamento no Pix ou no cartão.");
  motivos.push("Envio para todo o Brasil.");
  return motivos;
}
