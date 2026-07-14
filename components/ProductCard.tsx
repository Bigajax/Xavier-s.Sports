import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/data/products";
import { brl, installmentText, discountPct } from "@/lib/format";
import { waProduct } from "@/lib/whatsapp";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";

function badge(p: Product): { label: string; tone: string } | null {
  if (p.onSale) return { label: "Oferta", tone: "bg-promo text-white" };
  if (p.collection === "retro") return { label: "Retrô", tone: "bg-ink text-amarelo" };
  if (p.newArrival) return { label: "Novo", tone: "bg-amarelo text-ink" };
  if (p.bestSeller) return { label: "Mais procurada", tone: "bg-roxo text-white" };
  if (p.audience === "feminino") return { label: "Feminina", tone: "bg-roxo-escuro text-white" };
  if (p.audience === "infantil") return { label: "Infantil", tone: "bg-roxo-escuro text-white" };
  return null;
}

function sizeSummary(p: Product): string {
  const ok = p.sizes.filter((s) => s.status !== "indisponivel");
  if (ok.length === 0) return "Sob consulta";
  return `Do ${ok[0].label} ao ${ok[ok.length - 1].label}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const b = badge(product);
  const off = discountPct(product.price, product.oldPrice);
  const parcel = installmentText(product.price, product.installments);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-xl">
      <Link
        href={`/produto/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-cloud"
        aria-label={`Ver detalhes de ${product.name}`}
      >
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
      </Link>
      <FavoriteButton
        slug={product.slug}
        name={product.name}
        className="absolute right-3 top-3 opacity-90"
      />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">
          {product.team}
          {product.season ? ` · ${product.season}` : ""}
        </p>
        <Link href={`/produto/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 font-semibold leading-snug text-ink group-hover:text-roxo">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="tabular-nums text-lg font-bold text-ink">
            {brl(product.price)}
          </span>
          {product.oldPrice && (
            <span className="tabular-nums text-sm text-steel line-through">
              {brl(product.oldPrice)}
            </span>
          )}
        </div>
        {parcel && <p className="text-xs text-steel">{parcel}</p>}
        <p className="mt-1 text-xs text-steel">Disponível: {sizeSummary(product)}</p>

        <div className="mt-auto flex items-center gap-2 pt-3 sm:pt-4">
          <Link
            href={`/produto/${product.slug}`}
            className="min-w-0 flex-1 whitespace-nowrap rounded-lg bg-roxo px-2 py-2.5 text-center text-xs font-bold text-white transition-colors hover:bg-roxo-escuro sm:px-3 sm:text-sm"
          >
            Ver detalhes
          </Link>
          <a
            href={waProduct(product)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar ${product.name} no WhatsApp`}
            className="shrink-0 rounded-lg bg-whats/10 p-2 text-whats transition-colors hover:bg-whats hover:text-white sm:p-2.5"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
