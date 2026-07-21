"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ProductImage from "@/components/ProductImage";
import { purchasableVariants, type Product } from "@/lib/products/types";
import { useProductLookup } from "@/components/CatalogProvider";
import { useFavorites } from "@/lib/favorites";
import { waFavorites } from "@/lib/whatsapp";
import { brl } from "@/lib/format";

/** Painel lateral (direita) com as camisas favoritadas, sem sair da página. */
export default function FavoritesDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { slugs, sizes, setSize, toggle, ready } = useFavorites();
  const getProduct = useProductLookup();
  const products = ready
    ? slugs.map(getProduct).filter((p): p is Product => Boolean(p))
    : [];

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
            aria-label="Fechar favoritos"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-[56] flex w-[88%] max-w-sm flex-col bg-ink text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Favoritos"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="display flex items-center gap-2 text-2xl">
                <Heart
                  className="h-5 w-5 fill-amarelo text-amarelo"
                  aria-hidden="true"
                />
                Favoritos
                {products.length > 0 && (
                  <span className="text-base text-white/60">
                    ({products.length})
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                aria-label="Fechar favoritos"
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <Heart className="h-10 w-10 text-white/25" aria-hidden="true" />
                <p className="text-white/70">
                  Você ainda não favoritou nenhuma camisa.
                </p>
                <Link
                  href="/catalogo"
                  onClick={onClose}
                  className="xavier-tag bg-amarelo px-6 py-3 text-sm text-ink"
                >
                  <span>Explorar camisas</span>
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-1 overflow-y-auto p-3">
                  {products.map((p) => (
                    <li
                      key={p.slug}
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
                          <p className="mt-0.5 text-xs text-white/60">
                            {p.team}
                          </p>
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="tabular-nums text-sm font-bold text-amarelo">
                            {brl(p.price)}
                          </p>
                          <label className="sr-only" htmlFor={`fav-tam-${p.slug}`}>
                            Tamanho de {p.name}
                          </label>
                          <select
                            id={`fav-tam-${p.slug}`}
                            value={sizes[p.slug] ?? ""}
                            onChange={(e) => setSize(p.slug, e.target.value)}
                            className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs text-white [&>option]:text-ink"
                          >
                            <option value="">Tam.: a definir</option>
                            {purchasableVariants(p).map((s) => (
                              <option key={s.label} value={s.label}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(p.slug)}
                        aria-label={`Remover ${p.name} dos favoritos`}
                        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 border-t border-white/10 p-4">
                  <a
                    href={waFavorites(
                      products.map((p) => ({
                        name: `${p.name} (${p.team})`,
                        size: sizes[p.slug],
                      }))
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3 font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                    Consultar lista pelo WhatsApp
                  </a>
                  <Link
                    href="/favoritos"
                    onClick={onClose}
                    className="block text-center text-sm font-semibold text-white/70 hover:text-amarelo"
                  >
                    Ver página de favoritos →
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
