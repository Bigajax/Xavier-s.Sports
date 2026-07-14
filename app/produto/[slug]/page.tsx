import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getProduct, products, related } from "@/data/products";
import { brl, installmentText, discountPct } from "@/lib/format";
import { site } from "@/config/site";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import ProductGrid from "@/components/ProductGrid";
import RegisterView from "@/components/RegisterView";
import RecentlyViewed from "@/components/RecentlyViewed";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | ${product.team}`,
    description: `${product.name} — ${product.team}, temporada ${product.season}. ${brl(product.price)}. Consulte tamanhos e disponibilidade pelo WhatsApp.`,
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0] }] }
      : undefined,
  };
}

const versionLabels: Record<string, string> = {
  torcedor: "Torcedor",
  jogador: "Jogador",
  treino: "Treino",
  "pre-jogo": "Pré-jogo",
  goleiro: "Goleiro",
  retro: "Retrô",
};

const audienceLabels: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  infantil: "Infantil",
  unissex: "Unissex",
};

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group border-b border-ink/10 py-4 open:pb-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="display-upright text-base text-ink">{title}</span>
        <ChevronDown
          className="h-4 w-4 text-steel transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-steel">
        {children}
      </div>
    </details>
  );
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const off = discountPct(product.price, product.oldPrice);
  const parcel = installmentText(product.price, product.installments);
  const teamHref =
    product.teamType === "clube"
      ? `/clubes/${product.teamSlug}`
      : `/selecoes/${product.teamSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <RegisterView slug={product.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-6 md:pb-12">
        {/* breadcrumbs */}
        <nav aria-label="Você está em" className="text-xs text-steel">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-roxo">Início</Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-roxo">Catálogo</Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li>
              <Link href={teamHref} className="hover:text-roxo">
                {product.team}
              </Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <ProductGallery product={product} />

          <div>
            <Link
              href={teamHref}
              className="text-sm font-bold uppercase tracking-wide text-roxo hover:underline"
            >
              {product.team}
            </Link>
            <h1 className="display mt-2 text-3xl leading-tight text-ink sm:text-4xl">
              {product.name}
            </h1>

            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-steel">
              {product.season && (
                <div className="flex gap-1">
                  <dt>Temporada:</dt>
                  <dd className="font-semibold text-ink">{product.season}</dd>
                </div>
              )}
              <div className="flex gap-1">
                <dt>Versão:</dt>
                <dd className="font-semibold text-ink">
                  {versionLabels[product.version]}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt>Público:</dt>
                <dd className="font-semibold text-ink">
                  {audienceLabels[product.audience]}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt>Manga:</dt>
                <dd className="font-semibold text-ink">
                  {product.sleeve === "curta" ? "Curta" : "Longa"}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt>Código:</dt>
                <dd className="font-semibold text-ink">{product.sku}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="tabular-nums display text-4xl text-ink">
                {brl(product.price)}
              </span>
              {product.oldPrice && (
                <span className="tabular-nums text-lg text-steel line-through">
                  {brl(product.oldPrice)}
                </span>
              )}
              {off && (
                <span className="xavier-tag bg-promo px-2 py-1 text-xs text-white">
                  <span>-{off}%</span>
                </span>
              )}
            </div>
            {parcel && <p className="mt-1 text-sm text-steel">{parcel}</p>}
            <p className="mt-2 text-xs text-steel">
              Preço demonstrativo — valor final confirmado no atendimento.
            </p>

            <ProductActions product={product} />

            {/* Acordeões */}
            <div className="mt-8">
              <Accordion title="Detalhes da camisa" open>
                <p>{product.description}</p>
                <p>
                  Cores: {product.colors.join(", ")}.
                  {product.material ? ` Material: ${product.material}.` : ""}
                </p>
              </Accordion>
              <Accordion title="Guia de tamanhos">
                <p>
                  As medidas podem variar entre modelos e versões. Compare com
                  uma peça que você já utiliza.
                </p>
                <p>
                  <Link href="/guia-de-tamanhos" className="font-semibold text-roxo hover:underline">
                    Ver o guia completo de medidas →
                  </Link>
                </p>
              </Accordion>
              <Accordion title="Personalização">
                <p>
                  {product.personalizationAvailable
                    ? "Este modelo aceita consulta de personalização com nome e número. A aplicação, a fonte e o prazo dependem de confirmação da equipe."
                    : "Este modelo não possui personalização disponível no momento."}
                </p>
                <p>
                  Peças personalizadas podem ter condições específicas para
                  troca e devolução.
                </p>
              </Accordion>
              <Accordion title="Como comprar">
                <p>
                  Selecione o tamanho, toque em “Consultar disponibilidade” e
                  envie a mensagem gerada pelo WhatsApp. A equipe confirma
                  estoque, valor final, pagamento e envio.
                </p>
              </Accordion>
              <Accordion title="Pagamento">
                <p>{site.paymentText}</p>
              </Accordion>
              <Accordion title="Envio">
                <p>{site.shippingText}</p>
              </Accordion>
              <Accordion title="Trocas">
                <p>
                  Trocas de tamanho estão sujeitas à disponibilidade e às
                  condições da política da loja.{" "}
                  <Link href="/trocas" className="font-semibold text-roxo hover:underline">
                    Ver política de trocas →
                  </Link>
                </p>
              </Accordion>
              {product.careInstructions && (
                <Accordion title="Cuidados com a peça">
                  <ul className="list-disc space-y-1 pl-4">
                    {product.careInstructions.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        <section className="mt-16">
          <h2 className="display text-3xl text-ink">
            <span className="swoosh">Você também pode gostar</span>
          </h2>
          <div className="mt-6">
            <ProductGrid products={related(product, 4)} />
          </div>
        </section>
      </div>

      <RecentlyViewed excludeSlug={product.slug} />
    </>
  );
}
