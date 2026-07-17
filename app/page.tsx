import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import Hero from "@/components/Hero";
import HomeSearch from "@/components/HomeSearch";
import HowItWorks from "@/components/HowItWorks";
import WhyXaviers from "@/components/WhyXaviers";
import ProductCarousel from "@/components/ProductCarousel";
import RetroSection from "@/components/RetroSection";
import InstagramGrid from "@/components/InstagramGrid";
import NewsletterForm from "@/components/NewsletterForm";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { categories } from "@/data/categories";
import { newArrivals, bestSellers, findProduct } from "@/lib/products/types";
import { applyFilters, sortProducts } from "@/lib/catalog";
import { getCatalog } from "@/lib/products/db";
import { waGeneric, waPersonalizacao } from "@/lib/whatsapp";

const personalizationSteps = [
  "Escolha a camisa.",
  "Selecione o tamanho.",
  "Informe nome e número.",
  "Consulte valor e prazo.",
  "Confirme com a equipe pelo WhatsApp.",
];

/** Categorias em destaque na home; as demais viram filtros no catálogo. */
const homeCategorySlugs = [
  "clubes-brasileiros",
  "clubes-internacionais",
  "selecoes",
  "retro",
];

export default async function HomePage() {
  let catalog: Awaited<ReturnType<typeof getCatalog>> = [];
  try {
    catalog = await getCatalog();
  } catch {
    // Sem catálogo a home ainda funciona: carrosséis ficam vazios e as
    // seções institucionais seguem no ar.
  }
  const prontaEntrega = sortProducts(
    applyFilters(catalog, { onlyReadyToShip: true }),
    "procuradas"
  ).slice(0, 8);
  const maisProcuradas = bestSellers(catalog).slice(0, 4);
  const lancamentos = newArrivals(catalog).slice(0, 8);
  const homeCategories = homeCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c) => c !== undefined);

  return (
    <>
      <Hero />

      {/* Busca + atalhos por time */}
      <section id="busca" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Busca"
              title="Qual camisa você está procurando?"
              align="center"
            />
          </Reveal>
          <div className="mt-8">
            <HomeSearch />
          </div>
        </div>
      </section>

      {/* Pronta entrega */}
      {prontaEntrega.length > 0 && (
        <section className="bg-cloud">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading
                  eyebrow="Pronta entrega"
                  title="Camisas prontas para sair"
                  subtitle="Modelos com tamanhos disponíveis para confirmação imediata."
                />
                <Link
                  href="/catalogo?disponibilidade=pronta"
                  className="text-sm font-bold text-roxo hover:underline"
                >
                  Ver todas →
                </Link>
              </div>
            </Reveal>
            <div className="mt-8">
              <ProductCarousel products={prontaEntrega} />
            </div>
          </div>
        </section>
      )}

      {/* Mais procuradas */}
      {maisProcuradas.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <Reveal>
              <SectionHeading
                eyebrow="Destaques"
                title="As favoritas da torcida"
              />
            </Reveal>
            <div className="mt-8">
              <ProductCarousel products={maisProcuradas} />
            </div>
          </div>
        </section>
      )}

      {/* Categorias principais */}
      <section className="bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Categorias"
              title="Encontre o seu jeito de torcer"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {homeCategories.map((c) => {
              const cover = c.coverProduct
                ? findProduct(catalog, c.coverProduct)
                : undefined;
              const img = cover?.images[0];
              return (
                <Link
                  key={c.slug}
                  href={`/catalogo?categoria=${c.slug}`}
                  className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-xl bg-roxo-escuro p-3.5 text-white sm:h-44 sm:p-4"
                >
                  {img && (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover opacity-45 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-55"
                    />
                  )}
                  <span className="relative">
                    <h3 className="display text-xl leading-none sm:text-2xl">{c.name}</h3>
                    <p className="mt-1 hidden text-sm text-white/75 sm:block">{c.description}</p>
                    <span className="mt-1.5 flex items-center gap-1 text-xs font-bold text-amarelo sm:mt-2 sm:text-sm">
                      Ver camisas
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Como funciona + confiança */}
      <HowItWorks />

      {/* Lançamentos */}
      {lancamentos.length > 0 && (
        <section className="bg-cloud">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading
                  eyebrow="Lançamentos"
                  title="Acabaram de entrar em campo"
                  subtitle="Confira os modelos mais recentes disponíveis na Xavier's Sports."
                />
                <Link
                  href="/lancamentos"
                  className="text-sm font-bold text-roxo hover:underline"
                >
                  Ver todos →
                </Link>
              </div>
            </Reveal>
            <div className="mt-8">
              <ProductCarousel products={lancamentos} />
            </div>
          </div>
        </section>
      )}

      {/* Retrô — editorial */}
      <RetroSection products={catalog} />

      {/* Personalização */}
      <section className="bg-roxo-escuro text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Personalização"
                title="Deixe a camisa com a sua identidade"
                subtitle="Consulte a possibilidade de adicionar nome, número ou personalização disponível para o modelo escolhido."
                tone="dark"
              />
            </Reveal>
            <a
              href={waPersonalizacao()}
              target="_blank"
              rel="noopener noreferrer"
              className="xavier-tag mt-8 inline-block bg-amarelo px-6 py-3 text-sm text-ink transition-transform hover:scale-[1.03]"
            >
              <span>Consultar personalização</span>
            </a>
            <p className="mt-5 max-w-md text-xs leading-relaxed text-white/60">
              A disponibilidade varia conforme o produto; fonte e aplicação
              podem variar; a personalização depende de confirmação da equipe e
              produtos personalizados podem ter regras específicas de troca.
              Nenhuma personalização é confirmada antes do atendimento.
            </p>
          </div>
          <ol className="space-y-3 self-center">
            {personalizationSteps.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-4 rounded-xl bg-white/5 p-4"
              >
                <span className="display w-10 shrink-0 text-center text-3xl text-amarelo">
                  {i + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Banner WhatsApp — recuperação */}
      <section className="bg-whats/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 md:px-6">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">
              Não encontrou sua camisa?
            </h2>
            <p className="mt-2 max-w-lg text-steel">
              Envie uma foto ou diga o modelo: a equipe consulta outros clubes,
              temporadas e tamanhos para você.
            </p>
          </div>
          <a
            href={waGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Pedir um modelo pelo WhatsApp
          </a>
        </div>
      </section>

      {/* Por que comprar com a Xavier's */}
      <WhyXaviers />

      {/* Instagram */}
      <InstagramGrid />

      {/* Lista de novidades */}
      <section className="field-lines bg-ink">
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Novidades em primeira mão"
              title="Entre para a lista da torcida"
              subtitle="Receba lançamentos, reposições e ofertas pelo WhatsApp."
              tone="dark"
            />
          </Reveal>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
