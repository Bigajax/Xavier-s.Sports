"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ProductImage from "@/components/ProductImage";
import { useProductLookup } from "@/components/CatalogProvider";
import {
  variantAvailability,
  type Product,
  type Variant,
} from "@/lib/products/types";
import { useCart, type CartItem } from "@/lib/cart";
import {
  waCart,
  type CartMessageItem,
  type OrderCustomer,
} from "@/lib/whatsapp";
import { brl } from "@/lib/format";
import { trackLead } from "@/lib/trackLead";
import { toast } from "@/components/Toaster";

type Line = { item: CartItem; product: Product };

type StockMap = Record<string, Variant[]>;

/** Disponibilidade efetiva de uma linha, com o estoque mais fresco que houver. */
function lineState(item: CartItem, product: Product, stock: StockMap) {
  const variants = stock[item.slug] ?? product.variants;
  if (!item.size) return { kind: "sem-tamanho" as const, variants };
  const variant = variants.find((v) => v.label === item.size);
  if (!variant) return { kind: "indisponivel" as const, variants };
  const avail = variantAvailability(variant);
  if (avail.kind === "indisponivel")
    return { kind: "indisponivel" as const, variants };
  if (avail.kind === "encomenda")
    return {
      kind: "encomenda" as const,
      variants,
      estimatedDelivery: avail.estimatedDelivery,
    };
  return { kind: "pronta-entrega" as const, variants, stock: avail.stock };
}

/** Painel lateral (direita) com a sacola de pedido — fecha no WhatsApp. */
export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, ready, setQty, setSize, remove, patchItems } = useCart();
  const getProduct = useProductLookup();
  const [stock, setStock] = useState<StockMap>({});
  const [stockError, setStockError] = useState(false);
  const [customer, setCustomer] = useState<OrderCustomer>({});
  const reconciledFor = useRef<string | null>(null);

  const lines: Line[] = ready
    ? items
        .map((item) => ({ item, product: getProduct(item.slug) }))
        .filter((l): l is Line => Boolean(l.product))
    : [];

  // Reconciliação ao abrir: busca estoque fresco, ajusta quantidades e
  // remarca disponibilidade. Guard por assinatura para não repetir toasts.
  useEffect(() => {
    if (!open || !ready || items.length === 0) return;
    const signature = items
      .map((i) => `${i.slug}::${i.size ?? ""}::${i.qty}`)
      .join("|");
    if (reconciledFor.current === signature) return;
    reconciledFor.current = signature;

    const slugs = [...new Set(items.map((i) => i.slug))];
    fetch(`/api/estoque?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((res) => {
        if (!res.ok) throw new Error("estoque indisponível");
        return res.json() as Promise<StockMap>;
      })
      .then((fresh) => {
        setStock(fresh);
        setStockError(false);

        const patches: Parameters<typeof patchItems>[0] = [];
        for (const item of items) {
          const variants = fresh[item.slug];
          if (!variants || !item.size) continue;
          const variant = variants.find((v) => v.label === item.size);
          if (!variant) continue;
          const avail = variantAvailability(variant);
          if (avail.kind === "pronta-entrega") {
            if (item.qty > avail.stock) {
              toast(
                `Existem apenas ${avail.stock} ${
                  avail.stock === 1 ? "unidade disponível" : "unidades disponíveis"
                } neste tamanho.`
              );
              patches.push({
                slug: item.slug,
                size: item.size,
                qty: avail.stock,
                availability: "pronta-entrega",
              });
            } else if (item.availability !== "pronta-entrega") {
              patches.push({
                slug: item.slug,
                size: item.size,
                availability: "pronta-entrega",
                estimatedDelivery: undefined,
              });
            }
          } else if (avail.kind === "encomenda") {
            if (
              item.availability !== "encomenda" ||
              item.estimatedDelivery !== avail.estimatedDelivery
            ) {
              patches.push({
                slug: item.slug,
                size: item.size,
                availability: "encomenda",
                estimatedDelivery: avail.estimatedDelivery,
              });
            }
          }
          // indisponível: mantém a linha para o cliente decidir (fica
          // esmaecida e fora da mensagem).
        }
        if (patches.length > 0) patchItems(patches);
      })
      .catch(() => setStockError(true));
  }, [open, ready, items, patchItems]);

  const states = lines.map((l) => ({
    ...l,
    state: lineState(l.item, l.product, stock),
  }));

  const orderable = states.filter(
    (s) => s.state.kind === "pronta-entrega" || s.state.kind === "encomenda"
  );
  const subtotal = orderable.reduce(
    (sum, l) => sum + l.product.price * l.item.qty,
    0
  );
  const mixed =
    orderable.some((s) => s.state.kind === "pronta-entrega") &&
    orderable.some((s) => s.state.kind === "encomenda");
  const pendingSize = states.some((s) => s.state.kind === "sem-tamanho");

  const messageItems: CartMessageItem[] = orderable.map(
    ({ item, product: p, state }) => ({
      name: p.name,
      version: p.version,
      size: item.size,
      qty: item.qty,
      unitPrice: p.price,
      availability:
        state.kind === "encomenda" ? "encomenda" : "pronta-entrega",
      estimatedDelivery:
        state.kind === "encomenda" ? state.estimatedDelivery : undefined,
    })
  );

  // Itens sem tamanho entram na mensagem com disponibilidade a confirmar,
  // para não travar o pedido — a equipe resolve no atendimento.
  for (const { item, product: p, state } of states) {
    if (state.kind !== "sem-tamanho") continue;
    messageItems.push({
      name: p.name,
      version: p.version,
      size: undefined,
      qty: item.qty,
      unitPrice: p.price,
      availability: "a-confirmar",
    });
  }
  const messageTotal = states
    .filter((s) => s.state.kind !== "indisponivel")
    .reduce((sum, l) => sum + l.product.price * l.item.qty, 0);

  const canOrder = messageItems.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-ink/60"
            onClick={onClose}
            aria-label="Fechar meu pedido"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col bg-white text-ink shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Meu pedido"
          >
            <header className="field-lines flex items-center justify-between bg-roxo-escuro px-5 py-4 text-white">
              <div>
                <p className="display flex items-center gap-2.5 text-3xl leading-none">
                  Minha sacola
                  {lines.length > 0 && (
                    <span className="xs-gaveta__conta">
                      {lines.reduce((s, l) => s + l.item.qty, 0)}
                    </span>
                  )}
                </p>
                <p className="mt-1.5 text-xs text-white/70">Confira as camisas e envie o pedido inteiro pelo WhatsApp.</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar meu pedido"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>

            {stockError && lines.length > 0 && (
              <p className="flex items-start gap-2 border-b border-ink/10 bg-cloud px-4 py-2.5 text-xs text-ink/70">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-roxo"
                  aria-hidden="true"
                />
                Não foi possível confirmar o estoque agora. A disponibilidade
                é confirmada pela equipe no atendimento.
              </p>
            )}

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <span className="grid h-14 w-14 -skew-x-[8deg] place-items-center bg-roxo/10">
                  <ShoppingBag className="h-6 w-6 skew-x-[8deg] text-roxo" aria-hidden="true" />
                </span>
                <p className="display text-2xl">A sacola está vazia.</p>
                <p className="max-w-xs text-sm text-steel">
                  Junte as camisas aqui e envie o pedido inteiro de uma vez
                  pelo WhatsApp.
                </p>
                <Link
                  href="/catalogo"
                  onClick={onClose}
                  className="xavier-tag bg-amarelo px-6 py-3 text-sm text-ink"
                >
                  <span>Ver camisas</span>
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
                  {states.map(({ item, product: p, state }) => {
                    const unavailable = state.kind === "indisponivel";
                    const maxQty =
                      state.kind === "pronta-entrega" ? state.stock : undefined;
                    return (
                      <li
                        key={`${item.slug}::${item.size ?? ""}`}
                        className={`flex items-start gap-4 py-4 ${
                          unavailable ? "opacity-50" : ""
                        }`}
                      >
                        <Link
                          href={`/produto/${p.slug}`}
                          onClick={onClose}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-cloud"
                        >
                          <ProductImage product={p} sizes="96px" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/produto/${p.slug}`} onClick={onClose}>
                            <p className="line-clamp-2 text-sm font-semibold leading-snug hover:text-roxo">
                              {p.name}
                            </p>
                          </Link>
                          {/* Disponibilidade da linha */}
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">
                            {state.kind === "pronta-entrega" ? (
                              <span className="text-[#128c4a]">Pronta entrega</span>
                            ) : state.kind === "encomenda" ? (
                              <span className="text-roxo">
                                Sob encomenda
                                {state.estimatedDelivery
                                  ? ` · ${state.estimatedDelivery}`
                                  : ""}
                              </span>
                            ) : state.kind === "indisponivel" ? (
                              <span className="text-steel">
                                Tamanho indisponível: remova ou troque
                              </span>
                            ) : (
                              <span className="text-steel">
                                Tamanho a definir
                              </span>
                            )}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label
                              className="sr-only"
                              htmlFor={`sacola-tam-${p.slug}-${item.size ?? "x"}`}
                            >
                              Tamanho de {p.name}
                            </label>
                            <select
                              id={`sacola-tam-${p.slug}-${item.size ?? "x"}`}
                              value={item.size ?? ""}
                              onChange={(e) =>
                                setSize(
                                  item.slug,
                                  item.size,
                                  e.target.value || undefined
                                )
                              }
                              className="rounded-md border border-ink/15 bg-white px-1.5 py-0.5 text-xs text-ink"
                            >
                              <option value="">Tam.: a definir</option>
                              {state.variants
                                .filter(
                                  (v) =>
                                    variantAvailability(v).kind !==
                                      "indisponivel" || v.label === item.size
                                )
                                .map((v) => (
                                  <option key={v.label} value={v.label}>
                                    {v.label}
                                  </option>
                                ))}
                            </select>
                            <div
                              className="flex items-center rounded-md border border-ink/15"
                              role="group"
                              aria-label={`Quantidade de ${p.name}`}
                            >
                              <button
                                onClick={() =>
                                  setQty(item.slug, item.size, item.qty - 1)
                                }
                                disabled={item.qty <= 1}
                                aria-label="Diminuir quantidade"
                                className="p-1 text-ink/60 hover:text-ink disabled:opacity-30"
                              >
                                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <span className="min-w-5 text-center tabular-nums text-xs font-bold">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => {
                                  if (
                                    maxQty !== undefined &&
                                    item.qty + 1 > maxQty
                                  ) {
                                    toast(
                                      `Existem apenas ${maxQty} ${
                                        maxQty === 1
                                          ? "unidade disponível"
                                          : "unidades disponíveis"
                                      } neste tamanho.`
                                    );
                                    return;
                                  }
                                  setQty(item.slug, item.size, item.qty + 1);
                                }}
                                disabled={
                                  unavailable ||
                                  (maxQty !== undefined && item.qty >= maxQty)
                                }
                                aria-label="Aumentar quantidade"
                                className="p-1 text-ink/60 hover:text-ink disabled:opacity-30"
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1.5 tabular-nums text-base font-bold">
                            {brl(p.price * item.qty)}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(item.slug, item.size)}
                          aria-label={`Remover ${p.name} do pedido`}
                          className="rounded-lg p-2 text-steel hover:bg-cloud hover:text-ink"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-3 border-t border-ink/10 bg-cloud p-5">
                  {mixed && (
                    <p className="flex items-start gap-2 rounded-lg bg-cloud p-2.5 text-xs leading-relaxed text-ink/70">
                      <AlertTriangle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-roxo"
                        aria-hidden="true"
                      />
                      Seu pedido possui produtos com prazos diferentes. A loja
                      confirmará pelo WhatsApp se os itens serão enviados
                      juntos ou separadamente.
                    </p>
                  )}
                  {pendingSize && (
                    <p className="text-xs text-steel">
                      Itens sem tamanho definido são confirmados no
                      atendimento.
                    </p>
                  )}
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-ink/70">Total estimado</p>
                    <p className="display tabular-nums text-3xl leading-none">
                      {brl(messageTotal)}
                    </p>
                  </div>

                  {/* Dados opcionais do cliente — entram no fim da mensagem */}
                  {canOrder && (
                    <details className="group rounded-lg border border-ink/10 bg-white">
                      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                        Adiantar meus dados (opcional)
                        <span className="float-right transition-transform group-open:rotate-180">
                          ▾
                        </span>
                      </summary>
                      <div className="space-y-2 px-3 pb-3">
                        {(
                          [
                            ["Nome", "name", "Seu nome"],
                            ["Cidade", "city", "Ex.: Maringá - PR"],
                            ["Entrega", "delivery", "Ex.: retirada, envio..."],
                            ["Observação", "notes", "Algo que a loja deva saber"],
                          ] as const
                        ).map(([label, key, placeholder]) => (
                          <div key={key}>
                            <label
                              htmlFor={`pedido-${key}`}
                              className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-steel"
                            >
                              {label}
                            </label>
                            <input
                              id={`pedido-${key}`}
                              value={customer[key] ?? ""}
                              onChange={(e) =>
                                setCustomer((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder={placeholder}
                              maxLength={80}
                              className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink/35"
                            />
                          </div>
                        ))}
                        <div>
                          <label
                            htmlFor="pedido-payment"
                            className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-steel"
                          >
                            Pagamento
                          </label>
                          <select
                            id="pedido-payment"
                            value={customer.payment ?? ""}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                payment: (e.target.value ||
                                  undefined) as OrderCustomer["payment"],
                              }))
                            }
                            className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink"
                          >
                            <option value="">A combinar</option>
                            <option value="Pix">Pix</option>
                            <option value="Cartão de crédito">
                              Cartão de crédito
                            </option>
                          </select>
                        </div>
                      </div>
                    </details>
                  )}

                  {canOrder ? (
                    <a
                      href={waCart(messageItems, messageTotal, {
                        name: customer.name?.trim() || undefined,
                        city: customer.city?.trim() || undefined,
                        delivery: customer.delivery?.trim() || undefined,
                        payment: customer.payment,
                        notes: customer.notes?.trim() || undefined,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackLead({
                          productName:
                            messageItems.length === 1
                              ? messageItems[0].name
                              : `Pedido com ${messageItems.length} itens`,
                          size: messageItems.length === 1 ? messageItems[0].size : undefined,
                          shownPrice: messageTotal,
                          origin: "sacola",
                        })
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3.5 font-bold text-white transition-transform hover:scale-[1.02]"
                    >
                      <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                      Enviar pedido pelo WhatsApp
                    </a>
                    ) : (
                    <p className="rounded-xl bg-white px-4 py-3 text-center text-sm text-steel">
                      Os itens do pedido estão indisponíveis. Remova ou troque o
                      tamanho para enviar.
                    </p>
                  )}
                  <p className="text-center text-xs text-steel">
                    O pedido é confirmado pela equipe no atendimento.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
