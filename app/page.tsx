import fs from "node:fs";
import path from "node:path";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Hero from "@/components/Hero";
import Campanha from "@/components/Campanha";
import BenefitsBar from "@/components/BenefitsBar";
import FaixaMarcas from "@/components/FaixaMarcas";
import Trilho from "@/components/Trilho";
import BannerMeio from "@/components/BannerMeio";
import SocialProof from "@/components/SocialProof";
import RetroSection from "@/components/RetroSection";
import NewsletterForm from "@/components/NewsletterForm";
import { getCategory } from "@/data/categories";
import { teamCrest } from "@/data/teams";
import { bannersMeio, bannersTopo } from "@/data/banners";
import { PRE_ORDER_DELIVERY_RANGE } from "@/config/catalogo";
import { bestSellers, type Product } from "@/lib/products/types";
import { applyFilters } from "@/lib/catalog";
import { fabricantesDaFaixa } from "@/lib/fabricantes";
import { readyUnits, readySizes } from "@/lib/readyStock";
import { getCatalog } from "@/lib/products/db";
import { waGeneric, waPersonalizacao } from "@/lib/whatsapp";

const personalizationSteps = [
  { titulo: "Escolha a camisa e o tamanho", texto: "Na página da camisa, veja se o modelo aceita personalização." },
  { titulo: "Mande o nome e o número", texto: "Pelo WhatsApp, do jeito que quer na camisa." },
  { titulo: "A equipe confirma valor e prazo", texto: "A personalização varia conforme o modelo." },
  { titulo: "Você aprova e recebe em casa", texto: "Pagamento por Pix ou cartão, envio para todo o Brasil." },
];

/* a arte do banner já está em public/? (sem ela, o banner do topo não entra) */
const temArte = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

/* a temporada mais recente primeiro: "26/27" e "2026" antes de "2025" */
const anoDa = (p: Product) => Number(p.season?.match(/\d{2,4}/g)?.pop()?.padStart(4, "20") ?? 0);

/* um time por vez, para a fileira não abrir com cinco camisas do mesmo clube */
function intercalar(lista: Product[]): Product[] {
  const filas = new Map<string, Product[]>();
  for (const p of lista) filas.set(p.teamSlug, [...(filas.get(p.teamSlug) ?? []), p]);
  const colunas = [...filas.values()];
  const maior = Math.max(0, ...colunas.map((c) => c.length));
  return Array.from({ length: maior }, (_, i) => colunas.map((c) => c[i])).flat().filter((p): p is Product => Boolean(p));
}

/**
 * A HOME NO PADRÃO DO MOLDE (14/10/2026, pedido do Rafael: "seguir o molde da
 * vitrine"): os 3 banners, os benefícios, "Escolha pela marca", as fileiras
 * em trilho com os banners do meio entre elas, e a faixa de garantias colada
 * no rodapé (no layout). Ficam dela: a pronta entrega, a retrô, a
 * personalização, o "não encontrou" e a lista da torcida. Saíram a busca
 * (está no cabeçalho), as categorias em cartão (estão no menu), o "Como
 * funciona" (o molde tirou o como pedir da home), o "Por que comprar" (virou
 * a faixa de garantias) e a grade do Instagram.
 */
export default async function HomePage() {
  let catalog: Awaited<ReturnType<typeof getCatalog>> = [];
  try {
    catalog = await getCatalog();
  } catch {
    // Sem catálogo a home ainda funciona: as fileiras somem e as seções
    // institucionais seguem no ar.
  }

  const retro = catalog.filter((p) => p.collection === "retro").length;
  const preencher = (t: string) => t.replace("{retro}", String(retro)).replace("{prazo}", PRE_ORDER_DELIVERY_RANGE);
  const topo = bannersTopo.filter((b) => temArte(b.arte) && temArte(b.arteCelular)).map((b) => ({ ...b, linha: preencher(b.linha) }));
  const meio = Object.fromEntries(
    bannersMeio.filter((b) => b.ligado).map((b) => [b.chave, { banner: { ...b, linha: preencher(b.linha) }, comArte: temArte(b.arte) && temArte(b.arteCelular) }]),
  );

  // pronta entrega: maior estoque e maior variedade de tamanhos primeiro
  const todasProntas = applyFilters(catalog, { onlyReadyToShip: true });
  const prontaEntrega = [...todasProntas]
    .sort((a, b) => readyUnits(b) - readyUnits(a) || readySizes(b).length - readySizes(a).length)
    .slice(0, 12);
  const atuais = (slug: string) =>
    intercalar(applyFilters(catalog, { ...getCategory(slug)?.filters, collection: "atual" }).sort((a, b) => anoDa(b) - anoDa(a))).slice(0, 12);
  const selecoes = atuais("selecoes");
  const brasileiros = atuais("clubes-brasileiros");
  const quantas = (slug: string) => applyFilters(catalog, getCategory(slug)?.filters ?? {}).length;
  /* "destaques", não "favoritas da torcida": a marca best_seller veio do
     cadastro de demonstração de julho, não da venda; a fileira não afirma
     o que ninguém mediu */
  const favoritas = bestSellers(catalog).slice(0, 12);

  return (
    <>
      {topo.length ? <Campanha banners={topo} /> : <Hero />}

      <BenefitsBar />

      <FaixaMarcas marcas={fabricantesDaFaixa(catalog)} />

      <Trilho
        id="pronta-entrega"
        titulo="Tem no estoque, sai sem espera"
        linha="Camisas com o tamanho disponível agora, sem o prazo da encomenda."
        href="/pronta-entrega"
        verMais="Ver toda a pronta entrega"
        produtos={prontaEntrega}
        total={todasProntas.length}
        pronta
        fundo="cinza"
      />

      {meio.linha ? <BannerMeio {...meio.linha} /> : null}

      <Trilho
        id="selecoes"
        titulo="Seleções da Copa 2026"
        linha="Brasil, Argentina, França e mais. Torcedor por R$ 189, jogador por R$ 249."
        href="/catalogo?categoria=selecoes"
        verMais="Ver todas as seleções"
        produtos={selecoes}
        total={quantas("selecoes")}
      />

      {meio.cupom ? <BannerMeio {...meio.cupom} /> : null}

      <Trilho
        id="clubes-brasileiros"
        titulo="O manto do seu time"
        linha="Uniformes 26/27 de Flamengo, Corinthians, Palmeiras e mais. Em até 3x de R$ 63."
        href="/catalogo?categoria=clubes-brasileiros"
        verMais="Ver todos os clubes brasileiros"
        produtos={brasileiros}
        total={quantas("clubes-brasileiros")}
        fundo="cinza"
      />

      {favoritas.length >= 4 ? (
        <Trilho id="destaques" titulo="Destaques da Xavier's" linha="As camisas que a loja separou para você." href="/catalogo" verMais="Ver todas as camisas" produtos={favoritas} />
      ) : null}

      {/* Retrô — editorial */}
      <RetroSection products={catalog} total={retro} />

      {meio.entrega ? <BannerMeio {...meio.entrega} /> : null}

      {/* PERSONALIZAÇÃO (14/10/2026, pedido do Rafael: "melhora estes aqui"):
          sem a etiqueta pequena e sem os cinco cartões iguais. O título diz o
          que é, o botão diz o que faz, e os passos são uma linha do tempo.
          Sem número: o valor é "de referência" por camisa, e a equipe confirma. */}
      <section className="field-lines bg-roxo-escuro text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:px-6 md:py-20">
          <div>
            <h2 className="display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">Seu nome e número na camisa.</h2>
            <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
              Personalize a camisa do seu time ou da sua seleção. A equipe confirma o valor e o prazo para o modelo que você escolher.
            </p>
            <a
              href={waPersonalizacao()}
              target="_blank"
              rel="noopener noreferrer"
              className="xavier-tag mt-8 bg-amarelo px-7 py-3.5 text-sm text-ink transition-transform hover:scale-[1.03]"
            >
              {/* o .xavier-tag força inline-block no span filho (globals.css): o
                  alinhamento mora num span de dentro, que a regra não alcança */}
              <span>
                <span className="flex items-center gap-2">
                  <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                  Quero personalizar
                </span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-xs text-white/50">Disponível conforme o modelo. Camisa personalizada tem regras próprias de troca.</p>
          </div>
          <ol className="relative ml-5 space-y-7 border-l-2 border-white/15 pl-8 md:ml-0">
            {personalizationSteps.map((step, i) => (
              <li key={step.titulo} className="relative">
                <span className="display absolute -left-[3.05rem] top-0 grid h-9 w-9 -skew-x-[8deg] place-items-center bg-amarelo text-lg leading-none text-ink">
                  <span className="skew-x-[8deg]">{i + 1}</span>
                </span>
                <p className="display-upright text-lg leading-tight">{step.titulo}</p>
                <p className="mt-1 text-sm text-white/65">{step.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* NÃO ACHOU? Os escudos dos times mais procurados dizem "a gente tem
          muito mais", e o WhatsApp é o botão grande (antes era uma faixa
          verde-clara que sumia entre as seções escuras). */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="flex flex-col items-start gap-8 rounded-2xl bg-cloud p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex shrink-0 -space-x-3" aria-hidden="true">
                {["flamengo", "corinthians", "palmeiras", "real-madrid", "barcelona", "brasil"].map((t) => (
                  <span key={t} className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-md ring-2 ring-cloud">
                    <img src={teamCrest(t)} alt="" className="h-9 w-9 object-contain" />
                  </span>
                ))}
              </div>
              <div>
                <h2 className="display text-3xl leading-none text-ink sm:text-4xl">Não achou a camisa que procura?</h2>
                <p className="mt-2 max-w-xl text-steel">
                  Mande uma foto ou o nome do modelo. A equipe procura outros clubes, temporadas e tamanhos para você.
                </p>
              </div>
            </div>
            <a
              href={waGeneric()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2.5 rounded-xl bg-whats px-7 py-4 text-base font-bold text-white shadow-lg shadow-whats/25 transition-transform hover:scale-[1.03]"
            >
              <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Avaliações reais aprovadas no painel (some se não houver nenhuma) */}
      <SocialProof />

      {/* A LISTA DA TORCIDA, em duas colunas: o que a pessoa ganha à
          esquerda, o formulário num cartão à direita (antes era o formulário
          solto, sem dizer por que entrar). */}
      <section className="field-lines bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <h2 className="display text-4xl leading-[0.95] sm:text-5xl">Lançamento e reposição primeiro no seu WhatsApp.</h2>
            <ul className="mt-7 space-y-3.5">
              {[
                "A camisa nova do seu time assim que ela chega.",
                "O aviso quando o seu tamanho volta ao estoque.",
                "As ofertas da loja, direto no seu WhatsApp.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/85">
                  <span className="mt-1 grid h-5 w-5 shrink-0 -skew-x-[8deg] place-items-center bg-amarelo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 skew-x-[8deg] text-ink" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
