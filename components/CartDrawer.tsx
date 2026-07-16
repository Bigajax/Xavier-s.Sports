"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minus, Plus, ShoppingBag, X } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { getProduct, type Product } from "@/data/products";
import { useCart, type CartItem } from "@/lib/cart";
import { waCart } from "@/lib/whatsapp";
import { brl } from "@/lib/format";

type Line = { item: CartItem; product: Product };

/** Painel lateral (direita) com a sacola de pedido — fecha no WhatsApp. */
export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, ready, setQty, setSize, remove } = useCart();
  const lines: Line[] = ready
    ? items
        .map((item) => ({ item, product: getProduct(item.slug) }))
        .filter((l): l is Line => Boolean(l.product))
    : [];

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.price * l.item.qty,
    0
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-ink/70"
            onClick={onClose}
            aria-label="Fechar sacola"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-[56] flex w-[88%] max-w-sm flex-col bg-ink text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Sacola"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="display flex items-center gap-2 text-2xl">
                <ShoppingBag
                  className="h-5 w-5 text-amarelo"
                  aria-hidden="true"
                />
                Sacola
                {lines.length > 0 && (
                  <span className="text-base text-white/60">
                    ({lines.reduce((s, l) => s + l.item.qty, 0)})
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                aria-label="Fechar sacola"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <ShoppingBag
                  className="h-10 w-10 text-white/25"
                  aria-hidden="true"
                />
                <p className="text-white/70">
                  Sua sacola está vazia. Adicione camisas e envie o pedido
                  completo de uma vez.
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
                <ul className="flex-1 space-y-1 overflow-y-auto p-3">
                  {lines.map(({ item, product: p }) => (
                    <li
                      key={`${item.slug}::${item.size ?? ""}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                    >
                      <Link
                        href={`/produto/${p.slug}`}
                        onClick={onClose}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cloud"
                      >
                        <ProductImage product={p} sizes="64px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/produto/${p.slug}`} onClick={onClose}>
                          <p className="truncate text-sm font-semibold leading-snug hover:text-amarelo">
                            {p.name}
                          </p>
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
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
                            className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs text-white [&>option]:text-ink"
                          >
                            <option value="">Tam.: a definir</option>
                            {p.sizes
                              .filter((s) => s.status !== "indisponivel")
                              .map((s) => (
                                <option key={s.label} value={s.label}>
                                  {s.label}
                                </option>
                              ))}
                          </select>
                          <div
                            className="flex items-center rounded-md border border-white/20"
                            role="group"
                            aria-label={`Quantidade de ${p.name}`}
                          >
                            <button
                              onClick={() =>
                                setQty(item.slug, item.size, item.qty - 1)
                              }
                              disabled={item.qty <= 1}
                              aria-label="Diminuir quantidade"
                              className="p-1 text-white/70 hover:text-white disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="min-w-5 text-center tabular-nums text-xs font-bold">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                setQty(item.slug, item.size, item.qty + 1)
                              }
                              aria-label="Aumentar quantidade"
                              className="p-1 text-white/70 hover:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 tabular-nums text-sm font-bold text-amarelo">
                          {brl(p.price * item.qty)}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.slug, item.size)}
                        aria-label={`Remover ${p.name} da sacola`}
                        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-white/10 p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-white/70">Subtotal estimado</p>
                    <p className="tabular-nums text-lg font-bold text-amarelo">
                      {brl(subtotal)}
                    </p>
                  </div>
                  <a
                    href={waCart(
                      lines.map(({ item, product: p }) => ({
                        name: `${p.name} (${p.team})`,
                        size: item.size,
                        qty: item.qty,
                      })),
                      subtotal
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3 font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Finalizar pedido pelo WhatsApp
                  </a>
                  <p className="text-center text-xs text-white/50">
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
