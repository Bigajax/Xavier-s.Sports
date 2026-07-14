import { site } from "@/config/site";
import type { Product } from "@/data/products";

/** Monta o link wa.me com a mensagem codificada. Nunca abre automaticamente. */
export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function waDefault(): string {
  return waLink(site.whatsappDefaultMessage);
}

export function waGeneric(): string {
  return waLink(
    "Olá! Estou procurando uma camisa e gostaria de consultar os modelos disponíveis."
  );
}

export type Personalization = {
  wanted: boolean;
  name?: string;
  number?: string;
  notes?: string;
};

/** Mensagem da página de produto — campos vazios são omitidos. */
export function waProduct(
  product: Pick<Product, "name" | "team" | "version">,
  size?: string,
  personalization?: Personalization
): string {
  const label = /^camisa|^kit/i.test(product.name)
    ? product.name
    : `camisa ${product.name}`;
  const parts: string[] = [
    `Olá! Vi a ${label} (${product.team}) no site da Xavier's Sports.`,
  ];
  const interest: string[] = [];
  if (size) interest.push(`tamanho ${size}`);
  interest.push(`versão ${product.version}`);
  parts.push(`Tenho interesse no ${interest.join(", ")}.`);

  if (personalization?.wanted) {
    parts.push("Personalização: sim.");
    if (personalization.name) parts.push(`Nome: ${personalization.name}.`);
    if (personalization.number) parts.push(`Número: ${personalization.number}.`);
    if (personalization.notes) parts.push(`Observações: ${personalization.notes}.`);
  } else {
    parts.push("Personalização: não.");
  }

  parts.push("Poderia confirmar disponibilidade, valor final e prazo de envio?");
  return waLink(parts.join(" "));
}

/** Lista de favoritos. */
export function waFavorites(
  items: { name: string; size?: string }[]
): string {
  const lines = [
    "Olá! Salvei estas camisas no site da Xavier's Sports e gostaria de consultar disponibilidade:",
    "",
    ...items.map(
      (item, i) =>
        `${i + 1}. ${item.name}${item.size ? `, tamanho ${item.size}` : ""}`
    ),
  ];
  return waLink(lines.join("\n"));
}

// ---------- Trocas e devoluções ----------

export function waTrocaTamanho(data: {
  pedido: string;
  produto: string;
  tamanhoAtual: string;
  novoTamanho: string;
}): string {
  return waLink(
    `Olá! Gostaria de solicitar uma troca de tamanho. Número do pedido: ${data.pedido}. Produto: ${data.produto}. Tamanho recebido: ${data.tamanhoAtual}. Tamanho desejado: ${data.novoTamanho}.`
  );
}

export function waDevolucao(data: {
  pedido: string;
  produto: string;
  motivo: string;
}): string {
  return waLink(
    `Olá! Gostaria de solicitar a devolução de um pedido. Número do pedido: ${data.pedido}. Produto: ${data.produto}. Motivo: ${data.motivo}.`
  );
}

export function waDefeito(data: {
  pedido: string;
  produto: string;
  problema: string;
}): string {
  return waLink(
    `Olá! Recebi um produto com possível problema. Número do pedido: ${data.pedido}. Produto: ${data.produto}. Descrição: ${data.problema}.`
  );
}

export function waProdutoIncorreto(data: {
  pedido: string;
  produtoSolicitado: string;
  produtoRecebido: string;
}): string {
  return waLink(
    `Olá! Recebi um produto diferente do meu pedido. Número do pedido: ${data.pedido}. Produto solicitado: ${data.produtoSolicitado}. Produto recebido: ${data.produtoRecebido}.`
  );
}

export function waPersonalizacao(): string {
  return waLink(
    "Olá! Gostaria de consultar as opções de personalização de nome e número para uma camisa."
  );
}
