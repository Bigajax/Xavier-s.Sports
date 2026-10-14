import Link from "next/link";
import { retroProducts, type Product } from "@/lib/products/types";
import { brl } from "@/lib/format";
import ProductImage from "@/components/ProductImage";

/**
 * Seção retrô com tratamento editorial de arquivo esportivo.
 *
 * O cabeçalho (14/10/2026, pedido do Rafael: "melhora o design, título e
 * subtítulo"): sem a etiqueta "Coleção retrô" em cima, o título diz o que é,
 * a linha traz a contagem real e o preço de tabela (R$ 229, config/catalogo),
 * e o botão fica colado ao texto. Saiu do pé o aviso interno ("descrições
 * demonstrativas e editáveis"), que tinha vazado para o site.
 */
export default function RetroSection({ products, total }: { products: Product[]; total?: number }) {
  const highlights = retroProducts(products).slice(0, 3);

  return (
    <section className="retro-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="display flex items-center gap-3 text-4xl leading-none text-ink sm:text-5xl">
              <span className="h-8 w-2.5 shrink-0 -skew-x-[8deg] bg-amarelo sm:h-10" aria-hidden="true" />
              Camisas que marcaram época
            </h2>
            <p className="mt-3 text-base leading-snug text-ink/65 sm:text-lg">
              {total ? `${total} retrôs de clubes e seleções` : "Retrôs de clubes e seleções"}, a partir de R$ 229. Em até 3x no cartão.
            </p>
          </div>
          <Link
            href="/retro"
            className="xavier-tag bg-ink px-7 py-3.5 text-sm text-amarelo transition-transform hover:scale-[1.03]"
          >
            <span>Ver as retrô</span>
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
      </div>
    </section>
  );
}
