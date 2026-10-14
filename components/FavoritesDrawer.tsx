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

/**
 * Painel lateral (direita) com as camisas favoritadas, sem sair da página.
 *
 * Redesenhado em 14/10/2026 no desenho das gavetas da casa: o cabeçalho no
 * roxo da marca com a contagem numa etiqueta amarela inclinada, o corpo
 * claro, a foto maior sobre o cinza, o nome inteiro em duas linhas (antes
 * cortava em "Camisa Brasil Home 2026 — Ver…") e o tamanho em botões, em vez
 * do seletor miúdo. O pé segue com a lista para o WhatsApp.
 */
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
            className="fixed inset-0 z-[55] bg-ink/60"
            onClick={onClose}
            aria-label="Fechar favoritos"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col bg-white text-ink shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Favoritos"
          >
            <header className="field-lines flex items-center justify-between bg-roxo-escuro px-5 py-4 text-white">
              <div>
                <p className="display flex items-center gap-2.5 text-3xl leading-none">
                  Meus favoritos
                  {products.length > 0 && (
                    <span className="xs-gaveta__conta">{products.length}</span>
                  )}
                </p>
                <p className="mt-1.5 text-xs text-white/70">As camisas que você guardou para ver depois.</p>
              </div>
              <button onClick={onClose} aria-label="Fechar favoritos" className="rounded-lg p-2 hover:bg-white/10">
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>

            {products.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="grid h-14 w-14 -skew-x-[8deg] place-items-center bg-roxo/10">
                  <Heart className="h-6 w-6 skew-x-[8deg] text-roxo" aria-hidden="true" />
                </span>
                <p className="display text-2xl">Nenhuma camisa guardada ainda.</p>
                <p className="max-w-xs text-sm text-steel">Toque no coração de uma camisa para guardar e ver depois.</p>
                <Link href="/catalogo" onClick={onClose} className="xavier-tag mt-2 bg-amarelo px-6 py-3 text-sm text-ink">
                  <span>Explorar camisas</span>
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
                  {products.map((p) => {
                    const tamanhos = purchasableVariants(p);
                    return (
                      <li key={p.slug} className="flex gap-4 py-4">
                        <Link
                          href={`/produto/${p.slug}`}
                          onClick={onClose}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-cloud"
                        >
                          <ProductImage product={p} sizes="96px" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <Link href={`/produto/${p.slug}`} onClick={onClose} className="min-w-0 flex-1">
                              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-roxo">{p.team}</p>
                              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug hover:text-roxo">{p.name}</p>
                            </Link>
                            <button
                              onClick={() => toggle(p.slug)}
                              aria-label={`Remover ${p.name} dos favoritos`}
                              className="-mr-1.5 -mt-1 rounded-lg p-1.5 text-steel hover:bg-cloud hover:text-ink"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          <p className="mt-1 tabular-nums text-base font-bold">{brl(p.price)}</p>
                          {tamanhos.length ? (
                            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={`Tamanho de ${p.name}`}>
                              {tamanhos.map((s) => {
                                const marcado = sizes[p.slug] === s.label;
                                return (
                                  <button
                                    key={s.label}
                                    type="button"
                                    aria-pressed={marcado}
                                    onClick={() => setSize(p.slug, marcado ? "" : s.label)}
                                    className={`min-w-9 rounded-md border px-2 py-1 text-xs font-bold transition-colors ${
                                      marcado ? "border-roxo bg-roxo text-white" : "border-ink/15 text-ink hover:border-roxo"
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-2 border-t border-ink/10 bg-cloud p-5">
                  <a
                    href={waFavorites(
                      products.map((p) => ({
                        name: `${p.name} (${p.team})`,
                        size: sizes[p.slug],
                      }))
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3.5 font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                    Consultar a lista pelo WhatsApp
                  </a>
                  <Link
                    href="/favoritos"
                    onClick={onClose}
                    className="block py-1 text-center text-sm font-semibold text-ink/70 underline underline-offset-4 hover:text-roxo"
                  >
                    Ver a página de favoritos
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
