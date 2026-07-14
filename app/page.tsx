import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import Hero from "@/components/Hero";
import BenefitsBar from "@/components/BenefitsBar";
import TeamCard from "@/components/TeamCard";
import ScrollRow from "@/components/ScrollRow";
import ProductCarousel from "@/components/ProductCarousel";
import RetroSection from "@/components/RetroSection";
import SocialProof from "@/components/SocialProof";
import InstagramGrid from "@/components/InstagramGrid";
import NewsletterForm from "@/components/NewsletterForm";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import {
  clubesBrasileiros,
  clubesInternacionais,
  selecoes,
  teamCrest,
} from "@/data/teams";
import { categories } from "@/data/categories";
import { leagues } from "@/data/leagues";
import { newArrivals, bestSellers, getProduct } from "@/data/products";
import { waGeneric, waPersonalizacao } from "@/lib/whatsapp";

const personalizationSteps = [
  "Escolha a camisa.",
  "Selecione o tamanho.",
  "Informe nome e número.",
  "Consulte valor e prazo.",
  "Confirme com a equipe pelo WhatsApp.",
];

const buySteps = [
  {
    title: "Escolha sua camisa",
    text: "Navegue por clubes, seleções ou temporadas.",
  },
  {
    title: "Selecione o tamanho",
    text: "Confira as medidas antes de solicitar.",
  },
  {
    title: "Envie pelo WhatsApp",
    text: "O site monta uma mensagem com todos os detalhes.",
  },
  {
    title: "Confirme o pedido",
    text: "A equipe informa disponibilidade, pagamento e envio.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <BenefitsBar />

      {/* 7.3 Navegue pelo seu time */}
      <section className="bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Navegue pelo seu time"
              title="Qual camisa representa você?"
            />
          </Reveal>
          {(
            [
              ["Clubes brasileiros", clubesBrasileiros],
              ["Clubes internacionais", clubesInternacionais],
              ["Seleções", selecoes],
            ] as const
          ).map(([label, list]) => (
            <div key={label} className="mt-8">
              <h3 className="display-upright text-lg text-steel">{label}</h3>
              <div className="mt-3">
                <ScrollRow fadeFrom="from-cloud" ariaLabel={label}>
                  {list.map((t) => (
                    <TeamCard key={t.slug} team={t} />
                  ))}
                </ScrollRow>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7.4 Categorias principais */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Categorias"
              title="Encontre o seu jeito de torcer"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((c) => {
              const cover = c.coverProduct ? getProduct(c.coverProduct) : undefined;
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

      {/* 7.5 Lançamentos */}
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
            <ProductCarousel products={newArrivals.slice(0, 8)} />
          </div>
        </div>
      </section>

      {/* 7.6 Retrô */}
      <RetroSection />

      {/* 7.7 Seleções */}
      <section className="field-lines bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Seleções"
              title="Vista as cores do seu país"
              tone="dark"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selecoes.slice(0, 8).map((t) => (
              <Link
                key={t.slug}
                href={`/selecoes/${t.slug}`}
                className="group relative overflow-hidden rounded-xl bg-white p-5 transition-transform hover:-translate-y-0.5"
              >
                {/* dupla faixa diagonal nas cores da seleção */}
                <span
                  aria-hidden="true"
                  className="absolute -right-3 inset-y-0 w-9 -skew-x-[8deg]"
                  style={{ backgroundColor: t.colors[0] }}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-8 inset-y-0 w-2 -skew-x-[8deg]"
                  style={{ backgroundColor: t.colors[1] }}
                />
                <Image
                  src={teamCrest(t.slug)}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain transition-transform group-hover:scale-110"
                />
                <span className="display mt-3 block text-2xl text-ink">
                  {t.name}
                </span>
                <span className="mt-1 block text-xs font-bold text-roxo">
                  Ver camisas →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7.8 Mais procuradas */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Destaques"
              title="As favoritas da torcida"
            />
          </Reveal>
          <div className="mt-8">
            <ProductCarousel products={bestSellers.slice(0, 8)} />
          </div>
        </div>
      </section>

      {/* 7.9 Escolha por campeonato */}
      <section className="bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Campeonatos" title="Escolha por campeonato" />
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {leagues.map((l) => (
              <Link
                key={l.slug}
                href={`/catalogo?liga=${l.slug}`}
                className="xavier-tag border-2 border-ink/10 bg-white px-5 py-2.5 text-sm text-ink transition-colors hover:border-roxo hover:text-roxo"
              >
                <span>{l.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7.10 Personalização */}
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

      {/* 7.11 Como comprar */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Passo a passo"
                title="Comprar é simples assim"
              />
              <Link
                href="/como-comprar"
                className="text-sm font-bold text-roxo hover:underline"
              >
                Ver como funciona →
              </Link>
            </div>
          </Reveal>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {buySteps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-ink/10 bg-cloud/50 p-5"
              >
                <span className="display text-4xl text-roxo/30">{i + 1}</span>
                <h3 className="display-upright mt-2 text-lg text-ink">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-steel">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7.12 Banner WhatsApp */}
      <section className="bg-whats/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 md:px-6">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">
              Não encontrou sua camisa?
            </h2>
            <p className="mt-2 max-w-lg text-steel">
              Fale com a equipe e consulte outros clubes, temporadas, tamanhos
              ou modelos.
            </p>
          </div>
          <a
            href={waGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Pedir pelo WhatsApp
          </a>
        </div>
      </section>

      {/* 7.13 Prova social */}
      <SocialProof />

      {/* 7.14 Instagram */}
      <InstagramGrid />

      {/* 7.15 Lista de novidades */}
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
