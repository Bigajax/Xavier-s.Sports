import Link from "next/link";
import { Clock } from "lucide-react";
import {
  availabilitySummary,
  type Product,
} from "@/lib/products/types";
import { brl, installmentText, discountPct } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";

/** No máximo um badge editorial por card — menos ruído, decisão mais fácil. */
function badge(p: Product): { label: string; tone: string } | null {
  if (p.onSale) return { label: "Oferta", tone: "bg-promo text-white" };
  if (p.collection === "retro") return { label: "Retrô", tone: "bg-ink text-amarelo" };
  if (p.newArrival) return { label: "Novo", tone: "bg-amarelo text-ink" };
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const b = badge(product);
  const avail = availabilitySummary(product);
  const off = discountPct(product.price, product.oldPrice);
  const parcel = installmentText(product.price, product.installments);
  const soldOut = avail.kind === "esgotado";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-cloud">
        <ProductImage
          product={product}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {b && (
          <span
            className={`xavier-tag absolute left-3 top-3 px-2.5 py-1 text-xs ${b.tone}`}
          >
            <span>{b.label}</span>
          </span>
        )}
        {off && (
          <span
            className={`xavier-tag absolute left-3 bg-promo px-2 py-1 text-xs text-white ${
              b ? "top-10" : "top-3"
            }`}
          >
            <span>-{off}%</span>
          </span>
        )}
      </div>
      <FavoriteButton
        slug={product.slug}
        name={product.name}
        className="absolute right-3 top-3 z-10 opacity-90"
      />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">
          {product.team}
          {product.season ? ` · ${product.season}` : ""}
        </p>
        {/* stretched-link: cobre o card inteiro sem aninhar interativos */}
        <Link
          href={`/produto/${product.slug}`}
          className="mt-1 after:absolute after:inset-0 after:content-['']"
        >
          <h3 className="line-clamp-2 font-semibold leading-snug text-ink group-hover:text-roxo">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="tabular-nums text-xl font-bold text-ink">
            {brl(product.price)}
          </span>
          {product.oldPrice && (
            <span className="tabular-nums text-sm text-steel line-through">
              {brl(product.oldPrice)}
            </span>
          )}
        </div>
        {parcel && <p className="text-xs text-steel">{parcel}</p>}
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
            avail.kind === "pronta-entrega"
              ? "text-whats"
              : avail.kind === "sob-encomenda"
                ? "text-ink"
                : "text-steel"
          }`}
        >
          {avail.kind === "sob-encomenda" && (
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {avail.text}
          {avail.detail ? ` — ${avail.detail}` : ""}
        </p>

        <div className="mt-auto pt-3 sm:pt-4">
          <Link
            href={`/produto/${product.slug}${soldOut ? "" : "#tamanhos"}`}
            className="tap relative z-10 block w-full rounded-lg bg-roxo px-3 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-roxo-escuro"
          >
            {soldOut ? "Ver detalhes" : "Escolher tamanho"}
          </Link>
        </div>
      </div>
    </article>
  );
}
