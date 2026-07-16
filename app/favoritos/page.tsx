"use client";

import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { useProductLookup } from "@/components/CatalogProvider";
import { purchasableVariants } from "@/lib/products/types";
import { waFavorites } from "@/lib/whatsapp";
import { brl } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";
import SectionHeading from "@/components/SectionHeading";

export default function FavoritosPage() {
  const { slugs, sizes, setSize, ready, clear } = useFavorites();
  const getProduct = useProductLookup();

  const items = slugs
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const waHref = waFavorites(
    items.map((p) => ({ name: `${p.name} (${p.team})`, size: sizes[p.slug] }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Favoritos"
        title="Sua pré-escalação"
        subtitle="Salve as camisas que você quer, escolha os tamanhos e envie tudo de uma vez pelo WhatsApp."
      />

      {!ready ? null : items.length === 0 ? (
        <div className="mt-10 rounded-xl border-2 border-dashed border-steel/30 bg-cloud/50 p-12 text-center">
          <p className="display text-3xl text-ink">
            Sua lista ainda está sem camisas.
          </p>
          <p className="mt-3 text-steel">
            Toque no coração de qualquer produto para salvá-lo aqui.
          </p>
          <Link
            href="/catalogo"
            className="xavier-tag mt-6 inline-block bg-roxo px-6 py-3 text-sm text-white"
          >
            <span>Explorar catálogo</span>
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {items.map((p) => (
              <li
                key={p.slug}
                className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
              >
                <Link
                  href={`/produto/${p.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cloud"
                >
                  <ProductImage product={p} sizes="80px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/produto/${p.slug}`}
                    className="font-semibold text-ink hover:text-roxo"
                  >
                    {p.name}
                  </Link>
                  <p className="text-sm text-steel">
                    {p.team} · {p.season}
                  </p>
                  <p className="tabular-nums mt-1 font-bold text-ink">
                    {brl(p.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label
                      htmlFor={`tam-${p.slug}`}
                      className="mb-1 block text-xs font-semibold text-steel"
                    >
                      Tamanho
                    </label>
                    <select
                      id={`tam-${p.slug}`}
                      value={sizes[p.slug] ?? ""}
                      onChange={(e) => setSize(p.slug, e.target.value)}
                      className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">A definir</option>
                      {purchasableVariants(p).map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FavoriteButton
                    slug={p.slug}
                    name={p.name}
                    className="border border-ink/10"
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Enviar lista pelo WhatsApp
            </a>
            <button
              onClick={clear}
              className="flex items-center gap-2 rounded-xl border border-ink/15 px-5 py-4 text-sm font-bold text-steel hover:border-promo hover:text-promo"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Limpar favoritos
            </button>
          </div>
          <p className="mt-4 text-xs text-steel">
            A lista é salva apenas neste navegador. Disponibilidade e valores
            são confirmados pela equipe no atendimento.
          </p>
        </>
      )}
    </div>
  );
}
