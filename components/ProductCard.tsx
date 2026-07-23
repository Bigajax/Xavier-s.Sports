import Link from "next/link";
import { Clock, PackageCheck } from "lucide-react";
import {
  availabilitySummary,
  type Product,
} from "@/lib/products/types";
import { brl, installmentText, discountPct } from "@/lib/format";
import { readySizes, readyUnits, stockLabel } from "@/lib/readyStock";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";

/** No máximo um badge editorial por card — menos ruído, decisão mais fácil. */
function badge(p: Product): { label: string; tone: string } | null {
  if (p.onSale) return { label: "Oferta", tone: "bg-promo text-white" };
  if (p.collection === "retro") return { label: "Retrô", tone: "bg-ink text-amarelo" };
  if (p.newArrival) return { label: "Novo", tone: "bg-amarelo text-ink" };
  return null;
}

/**
 * `ready`: variante para a página de pronta entrega — troca o badge editorial
 * pelo selo verde "PRONTA ENTREGA" e lista os tamanhos disponíveis com a
 * indicação de estoque. Sem a prop, o card é idêntico ao do resto do site.
 */
export default function ProductCard({
  product,
  ready = false,
}: {
  product: Product;
  ready?: boolean;
}) {
  const b = ready ? null : badge(product);
  const avail = availabilitySummary(product);
  const off = discountPct(product.price, product.oldPrice);
  const parcel = installmentText(product.price, product.installments);
  const soldOut = avail.kind === "esgotado";
  const sizes = ready ? readySizes(product) : [];
  const units = ready ? readyUnits(product) : 0;

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
        {off && !ready && (
          <span
            className={`xavier-tag absolute left-3 bg-promo px-2 py-1 text-xs text-white ${
              b ? "top-10" : "top-3"
            }`}
          >
            <span>-{off}%</span>
          </span>
        )}
        {ready && (
          <span className="xavier-tag absolute left-3 top-3 flex items-center gap-1 bg-whats px-2.5 py-1 text-xs text-white">
            <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pronta entrega</span>
          </span>
        )}
      </div>
      <FavoriteButton
        slug={product.slug}
        name={product.name}
        className="absolute right-3 top-3 z-10 opacity-90"
      />

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-steel sm:text-xs">
          {product.team}
          {product.season ? ` · ${product.season}` : ""}
        </p>
        {/* stretched-link: cobre o card inteiro sem aninhar interativos */}
        <Link
          href={`/produto/${product.slug}`}
          className="mt-1 after:absolute after:inset-0 after:content-['']"
        >
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-roxo sm:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="tabular-nums text-lg font-bold text-ink sm:text-xl">
            {brl(product.price)}
          </span>
          {product.oldPrice && (
            <span className="tabular-nums text-sm text-steel line-through">
              {brl(product.oldPrice)}
            </span>
          )}
        </div>
        {parcel && <p className="hidden text-xs text-steel sm:block">{parcel}</p>}
        {ready ? (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1" aria-label="Tamanhos à pronta entrega">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="rounded border border-whats/40 bg-whats/10 px-1.5 py-0.5 text-[11px] font-bold text-whats"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-xs font-semibold text-whats">
              {stockLabel(units)}
            </p>
          </div>
        ) : (
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
        )}

        <div className="mt-auto pt-2 sm:pt-4">
          <Link
            href={`/produto/${product.slug}${soldOut ? "" : "#tamanhos"}`}
            className="tap relative z-10 block w-full rounded-lg bg-roxo px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-roxo-escuro sm:py-2.5 sm:text-sm"
          >
            {soldOut ? "Ver detalhes" : "Escolher tamanho"}
          </Link>
        </div>
      </div>
    </article>
  );
}
