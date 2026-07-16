import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { retroProducts, type Product } from "@/lib/products/types";
import { brl } from "@/lib/format";
import ProductImage from "@/components/ProductImage";

/** Seção retrô com tratamento editorial de arquivo esportivo. */
export default function RetroSection({ products }: { products: Product[] }) {
  const highlights = retroProducts(products).slice(0, 3);

  return (
    <section className="retro-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="xavier-eyebrow text-roxo">Coleção retrô</p>
            <h2 className="display mt-2 text-4xl text-ink sm:text-5xl">
              <span className="swoosh">Histórias que nunca saem de campo</span>
            </h2>
            <p className="mt-4 text-steel">
              Reviva temporadas, títulos e jogadores que marcaram gerações.
            </p>
          </div>
          <Link
            href="/retro"
            className="xavier-tag bg-ink px-6 py-3 text-sm text-amarelo transition-transform hover:scale-[1.03]"
          >
            <span className="flex items-center gap-2">
              Ver coleção retrô
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((p) => (
            <Link
              key={p.slug}
              href={`/produto/${p.slug}`}
              className="group overflow-hidden rounded-lg border border-ink/15 bg-white shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-ink/10 bg-cloud sepia-[0.12]">
                <ProductImage
                  product={p}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-sm border border-ink/20 bg-white/95 px-2 py-1 font-mono text-xs font-bold tracking-widest text-ink">
                  {p.season ?? "Retrô"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
                    Modelo retrô · {p.team}
                  </p>
                  <h3 className="mt-1 font-semibold leading-snug text-ink group-hover:text-roxo">
                    {p.name}
                  </h3>
                </div>
                <span className="tabular-nums shrink-0 font-bold text-ink">
                  {brl(p.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-xs text-steel">
          Modelos inspirados em temporadas históricas. Descrições demonstrativas
          e editáveis — consulte os detalhes de cada peça com a equipe.
        </p>
      </div>
    </section>
  );
}
