import { site } from "@/config/site";
import type { Product } from "@/lib/products/types";
import { brl } from "@/lib/format";

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

/** Disponibilidade que o site já conhece — muda o tom da mensagem. */
export type WaAvailability =
  | { kind: "pronta-entrega"; stock?: number; low?: boolean }
  | { kind: "encomenda"; estimatedDelivery?: string };

const versionLabels: Record<string, string> = {
  torcedor: "Torcedor",
  jogador: "Jogador",
  treino: "Treino",
  "pre-jogo": "Pré-jogo",
  goleiro: "Goleiro",
  retro: "Retrô",
};

/** Nome do produto sem o sufixo "— Versão X" (a versão tem bloco próprio). */
function productTitle(name: string): string {
  return name.replace(/\s*[—–-]\s*vers[ãa]o\s+.+$/i, "").trim();
}

/** Bloco "EMOJI RÓTULO \n valor" — a unidade visual da mensagem. */
function block(emoji: string, label: string, value: string): string {
  return `${emoji} ${label}\n${value}`;
}

/**
 * Mensagem da página de produto em blocos, fácil de ler no WhatsApp.
 * Campos vazios são omitidos; o tom muda conforme a disponibilidade.
 */
export function waProduct(
  product: Pick<Product, "name" | "version" | "price" | "personalizationPrice">,
  size?: string,
  personalization?: Personalization,
  availability?: WaAvailability
): string {
  const isOrder = availability?.kind === "pronta-entrega";
  const isPreOrder = availability?.kind === "encomenda";

  const greeting = isPreOrder
    ? `Olá! Quero fazer uma encomenda na ${site.name} ⚽`
    : isOrder
      ? `Olá! Quero fazer um pedido na ${site.name} ⚽`
      : `Olá! Vi este produto no site da ${site.name} ⚽`;

  const blocks: string[] = [greeting];
  blocks.push(block("📦", "PRODUTO", productTitle(product.name)));
  blocks.push(
    block("👕", "VERSÃO", versionLabels[product.version] ?? product.version)
  );
  if (size) blocks.push(block("📏", "TAMANHO", size));

  if (isOrder) {
    blocks.push(
      block(
        "✅",
        "DISPONIBILIDADE",
        availability.low && availability.stock
          ? `Pronta entrega — últimas ${availability.stock} unidades`
          : "Pronta entrega"
      )
    );
  } else if (isPreOrder) {
    blocks.push(block("🕒", "DISPONIBILIDADE", "Sob encomenda"));
    if (availability.estimatedDelivery) {
      blocks.push(block("📅", "PRAZO ESTIMADO", availability.estimatedDelivery));
    }
  }

  if (personalization?.wanted) {
    blocks.push(block("✍️", "PERSONALIZAÇÃO", "Sim"));
    if (personalization.name) blocks.push(block("🔤", "NOME", personalization.name));
    if (personalization.number)
      blocks.push(block("🔢", "NÚMERO", personalization.number));
    if (personalization.notes)
      blocks.push(block("📝", "OBSERVAÇÕES", personalization.notes));
    if (product.personalizationPrice) {
      blocks.push(
        block(
          "💵",
          "ADICIONAL DE PERSONALIZAÇÃO",
          brl(product.personalizationPrice)
        )
      );
    }
  } else {
    blocks.push(block("✍️", "PERSONALIZAÇÃO", "Não"));
  }

  blocks.push(block("💰", "VALOR", brl(product.price)));

  if (isOrder) {
    blocks.push(
      size
        ? "Pode me passar as formas de pagamento e entrega?"
        : "Pode confirmar os tamanhos disponíveis para mim?"
    );
  } else if (isPreOrder) {
    blocks.push(
      size
        ? "Pode confirmar a disponibilidade e o prazo para mim?"
        : "Pode confirmar os tamanhos e o prazo para mim?"
    );
  } else {
    blocks.push("Poderia confirmar a disponibilidade e o prazo de envio?");
  }

  return waLink(blocks.join("\n\n"));
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

export type CartMessageItem = {
  name: string;
  version?: string;
  size?: string;
  qty: number;
  unitPrice: number;
  availability: "pronta-entrega" | "encomenda" | "a-confirmar";
  estimatedDelivery?: string;
};

/** Dados opcionais que o cliente pode preencher antes de abrir o WhatsApp. */
export type OrderCustomer = {
  name?: string;
  city?: string;
  delivery?: string;
  notes?: string;
};

const availabilityText: Record<CartMessageItem["availability"], string> = {
  "pronta-entrega": "Pronta entrega",
  encomenda: "Sob encomenda",
  "a-confirmar": "A confirmar no atendimento",
};

const DIVIDER = "━━━━━━━━━━━━━━";

/**
 * Pedido consolidado da sacola — um bloco por item separado por divisor,
 * total do pedido e dados opcionais do cliente. Campos vazios são omitidos.
 */
export function waCart(
  items: CartMessageItem[],
  total: number,
  customer?: OrderCustomer
): string {
  const hasReady = items.some((i) => i.availability === "pronta-entrega");
  const hasPreOrder = items.some((i) => i.availability === "encomenda");
  const allPreOrder = items.length > 0 && !hasReady && items.every(
    (i) => i.availability === "encomenda"
  );
  const mixed = hasReady && hasPreOrder;

  const itemBlocks = items.map((item, i) => {
    const lines = [`📦 ITEM ${i + 1}`, ""];
    lines.push(`Produto: ${productTitle(item.name)}`);
    if (item.version) {
      lines.push(`Versão: ${versionLabels[item.version] ?? item.version}`);
    }
    lines.push(`Tamanho: ${item.size ?? "a definir"}`);
    lines.push(`Quantidade: ${item.qty}`);
    lines.push(`Disponibilidade: ${availabilityText[item.availability]}`);
    if (item.availability === "encomenda" && item.estimatedDelivery) {
      lines.push(`Prazo estimado: ${item.estimatedDelivery}`);
    }
    if (item.qty > 1) {
      lines.push(`Valor unitário: ${brl(item.unitPrice)}`);
      lines.push(`Subtotal: ${brl(item.unitPrice * item.qty)}`);
    } else {
      lines.push(`Valor: ${brl(item.unitPrice)}`);
    }
    return lines.join("\n");
  });

  const parts: string[] = [
    allPreOrder
      ? `Olá! Quero fazer uma encomenda na ${site.name} ⚽`
      : `Olá! Quero fazer um pedido na ${site.name} ⚽`,
    DIVIDER,
  ];
  for (const itemBlock of itemBlocks) {
    parts.push(itemBlock, DIVIDER);
  }
  parts.push(`🧾 TOTAL DO PEDIDO\n${brl(total)}`);

  if (mixed) {
    parts.push("O pedido possui itens com prazos diferentes.");
  }

  if (customer?.name) parts.push(`👤 CLIENTE\n${customer.name}`);
  if (customer?.city) parts.push(`📍 CIDADE\n${customer.city}`);
  if (customer?.delivery) parts.push(`🚚 ENTREGA\n${customer.delivery}`);
  if (customer?.notes) parts.push(`📝 OBSERVAÇÃO\n${customer.notes}`);

  parts.push(
    allPreOrder
      ? "Pode confirmar a disponibilidade e o prazo para mim?"
      : "Pode me passar as formas de pagamento e entrega?"
  );

  return waLink(parts.join("\n\n"));
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
